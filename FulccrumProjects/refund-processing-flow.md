# Customer Refund Processing Flow

## Overview

Comprehensive refund system for handling order cancellations with multiple refund methods, dispute resolution, and automated processing.

## Refund Flow Architecture

### **1. Refund Trigger Points**

#### Customer-Initiated Cancellation
```javascript
// Customer cancels order via app
async function customerCancelOrder(orderId, reason) {
  // Check cancellation eligibility
  const eligibility = await checkCancellationEligibility(orderId);
  
  if (!eligibility.canCancel) {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  // Calculate refund amount based on policy
  const refundAmount = await calculateRefundAmount(orderId, reason);
  
  // Process refund
  const refund = await processRefund({
    orderId,
    customerId: eligibility.customerId,
    amount: refundAmount.amount,
    fee: refundAmount.fee,
    reason: 'customer_cancelled',
    method: determineRefundMethod(eligibility)
  });
  
  // Update order status
  await updateOrderStatus(orderId, 'cancelled');
  
  // Notify customer
  await sendRefundNotification(refund);
  
  return refund;
}
```

#### Merchant-Initiated Cancellation
```javascript
// Merchant cancels order (out of stock, closed, etc.)
async function merchantCancelOrder(orderId, reason) {
  // Always full refund for merchant cancellations
  const order = await getOrder(orderId);
  
  const refund = await processRefund({
    orderId,
    customerId: order.customer_id,
    amount: order.total_amount,
    fee: 0, // No fee for merchant cancellations
    reason: 'merchant_cancelled',
    method: 'original_payment_method'
  });
  
  // Update order status
  await updateOrderStatus(orderId, 'cancelled');
  
  // Notify customer and driver
  await sendCancellationNotification(orderId, reason);
  
  return refund;
}
```

#### System-Initiated Refunds
```javascript
// System detects issues and processes refunds
async function systemRefund(orderId, reason) {
  const order = await getOrder(orderId);
  
  const refund = await processRefund({
    orderId,
    customerId: order.customer_id,
    amount: order.total_amount,
    fee: 0, // No fee for system errors
    reason: reason, // 'system_error', 'duplicate_charge', etc.
    method: 'original_payment_method'
  });
  
  // Log system event
  await logSystemEvent('refund_processed', { orderId, reason });
  
  return refund;
}
```

### **2. Refund Method Determination**

#### Refund Method Priority
```javascript
function determineRefundMethod(eligibility) {
  // Priority order for refund methods
  const refundMethods = [
    {
      method: 'original_payment_method',
      condition: eligibility.originalPaymentMethod !== 'cash_on_delivery',
      processingTime: '3-5 business days'
    },
    {
      method: 'wallet_credit',
      condition: eligibility.customerWalletExists,
      processingTime: 'instant'
    },
    {
      method: 'bank_transfer',
      condition: eligibility.customerBankAccount,
      processingTime: '1-2 business days'
    },
    {
      method: 'store_credit',
      condition: true, // Always available
      processingTime: 'instant'
    }
  ];
  
  // Return first available method
  return refundMethods.find(method => method.condition)?.method || 'store_credit';
}
```

#### Refund Processing by Method
```javascript
const refundProcessors = {
  // Original Payment Method (Credit Card, PayPal, etc.)
  original_payment_method: async (refund) => {
    try {
      // Process refund through payment provider
      const providerRefund = await paymentProvider.refund({
        paymentId: refund.original_payment_id,
        amount: refund.net_refund_amount,
        reason: refund.refund_reason
      });
      
      // Update refund with provider details
      await updateRefund(refund.id, {
        provider_refund_id: providerRefund.id,
        status: 'processing',
        estimated_completion: providerRefund.estimated_completion
      });
      
      return providerRefund;
    } catch (error) {
      // Fallback to wallet credit
      return await fallbackToWalletCredit(refund);
    }
  },
  
  // Wallet Credit (Instant)
  wallet_credit: async (refund) => {
    // Credit customer wallet
    await creditWallet(refund.customer_id, refund.net_refund_amount, {
      reference_id: refund.id,
      reference_type: 'refund',
      description: `Refund for order #${refund.order_id}`
    });
    
    // Update refund status
    await updateRefund(refund.id, {
      status: 'completed',
      processed_at: new Date()
    });
    
    return { status: 'completed', method: 'wallet_credit' };
  },
  
  // Bank Transfer
  bank_transfer: async (refund) => {
    // Create bank transfer request
    const transfer = await createBankTransfer({
      customerId: refund.customer_id,
      amount: refund.net_refund_amount,
      reference: `Refund for order #${refund.order_id}`
    });
    
    // Update refund status
    await updateRefund(refund.id, {
      status: 'processing',
      provider_refund_id: transfer.id,
      estimated_completion: transfer.estimated_completion
    });
    
    return transfer;
  },
  
  // Store Credit
  store_credit: async (refund) => {
    // Add store credit to customer account
    await addStoreCredit(refund.customer_id, refund.net_refund_amount, {
      orderId: refund.order_id,
      refundId: refund.id,
      expiresAt: addYears(new Date(), 1) // 1 year expiry
    });
    
    // Update refund status
    await updateRefund(refund.id, {
      status: 'completed',
      processed_at: new Date()
    });
    
    return { status: 'completed', method: 'store_credit' };
  }
};
```

### **3. Cancellation Eligibility Rules**

#### Time-Based Rules
```javascript
const cancellationRules = {
  // Customer cancellation time limits
  customerCancellation: {
    'pending': {
      timeLimit: 900, // 15 minutes
      refundPercentage: 100,
      refundFee: 0
    },
    'accepted': {
      timeLimit: 300, // 5 minutes after acceptance
      refundPercentage: 100,
      refundFee: 0.50 // Small processing fee
    },
    'preparing': {
      timeLimit: 0, // Cannot cancel once preparing
      refundPercentage: 0,
      refundFee: 0
    },
    'ready': {
      timeLimit: 0, // Cannot cancel once ready
      refundPercentage: 0,
      refundFee: 0
    }
  },
  
  // Merchant cancellation rules
  merchantCancellation: {
    'any_status': {
      refundPercentage: 100,
      refundFee: 0
    }
  },
  
  // System cancellation rules
  systemCancellation: {
    'any_status': {
      refundPercentage: 100,
      refundFee: 0
    }
  }
};
```

#### Business-Specific Policies
```javascript
async function getBusinessRefundPolicy(businessId) {
  const policy = await getRefundPolicy(businessId);
  
  return {
    cancellationTimeLimit: policy.cancellation_time_limit,
    refundPercentage: policy.refund_percentage,
    refundFee: policy.refund_fee,
    customConditions: policy.conditions
  };
}
```

### **4. Refund Calculation Logic**

#### Refund Amount Calculation
```javascript
async function calculateRefundAmount(orderId, reason) {
  const order = await getOrder(orderId);
  const businessPolicy = await getBusinessRefundPolicy(order.business_id);
  
  // Calculate base refund amount
  let refundAmount = order.total_amount;
  let refundFee = 0;
  
  // Apply business-specific rules
  if (reason === 'customer_cancelled') {
    refundAmount = (order.total_amount * businessPolicy.refund_percentage) / 100;
    refundFee = businessPolicy.refund_fee;
  }
  
  // Apply time-based rules
  const timeSinceOrder = Date.now() - new Date(order.placed_at);
  const timeRule = getTimeBasedRule(order.status, timeSinceOrder);
  
  if (timeRule) {
    refundAmount = Math.min(refundAmount, (order.total_amount * timeRule.refundPercentage) / 100);
    refundFee = Math.max(refundFee, timeRule.refundFee);
  }
  
  return {
    amount: refundAmount,
    fee: refundFee,
    netAmount: refundAmount - refundFee,
    breakdown: {
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      serviceFee: order.service_fee,
      taxAmount: order.tax_amount,
      tipAmount: order.tip_amount
    }
  };
}
```

### **5. Refund Status Tracking**

#### Refund Status Updates
```javascript
const refundStatusFlow = {
  'pending': ['processing', 'failed', 'cancelled'],
  'processing': ['completed', 'failed'],
  'completed': [], // Final state
  'failed': ['pending'], // Can retry
  'cancelled': [], // Final state
  'partial': ['completed', 'failed']
};

// Status update handler
async function updateRefundStatus(refundId, newStatus, metadata = {}) {
  const refund = await getRefund(refundId);
  
  // Validate status transition
  if (!refundStatusFlow[refund.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${refund.status} to ${newStatus}`);
  }
  
  // Update refund
  await updateRefund(refundId, {
    status: newStatus,
    updated_at: new Date(),
    ...metadata
  });
  
  // Send notification
  await sendRefundStatusNotification(refund, newStatus);
  
  // Log status change
  await logRefundStatusChange(refundId, refund.status, newStatus, metadata);
}
```

#### Provider Webhook Handling
```javascript
// Handle payment provider webhooks for refund status
async function handleRefundWebhook(providerRefundId, status, metadata) {
  const refund = await getRefundByProviderId(providerRefundId);
  
  if (!refund) {
    throw new Error('Refund not found for provider ID');
  }
  
  // Map provider status to our status
  const statusMap = {
    'succeeded': 'completed',
    'failed': 'failed',
    'pending': 'processing',
    'cancelled': 'cancelled'
  };
  
  const newStatus = statusMap[status] || 'failed';
  
  // Update refund status
  await updateRefundStatus(refund.id, newStatus, {
    provider_metadata: metadata,
    processed_at: new Date()
  });
  
  // If failed, try fallback method
  if (newStatus === 'failed') {
    await handleRefundFailure(refund);
  }
}
```

### **6. Refund Failure Handling**

#### Fallback Mechanisms
```javascript
async function handleRefundFailure(refund) {
  // Try alternative refund methods
  const fallbackMethods = ['wallet_credit', 'store_credit'];
  
  for (const method of fallbackMethods) {
    try {
      await processRefundWithMethod(refund, method);
      await updateRefundStatus(refund.id, 'completed');
      return;
    } catch (error) {
      console.error(`Fallback method ${method} failed:`, error);
    }
  }
  
  // If all methods fail, create manual review task
  await createManualReviewTask(refund);
  await updateRefundStatus(refund.id, 'failed');
}

async function fallbackToWalletCredit(refund) {
  try {
    await refundProcessors.wallet_credit(refund);
    await updateRefund(refund.id, {
      refund_method: 'wallet_credit',
      status: 'completed'
    });
  } catch (error) {
    throw new Error('All refund methods failed');
  }
}
```

### **7. Customer Communication**

#### Refund Notifications
```javascript
const refundNotifications = {
  // Refund initiated
  initiated: {
    email: 'refund_initiated',
    push: 'refund_started',
    sms: 'refund_processing'
  },
  
  // Refund processing
  processing: {
    email: 'refund_processing',
    push: 'refund_update'
  },
  
  // Refund completed
  completed: {
    email: 'refund_completed',
    push: 'refund_success',
    sms: 'refund_received'
  },
  
  // Refund failed
  failed: {
    email: 'refund_failed',
    push: 'refund_error',
    sms: 'refund_issue'
  }
};

async function sendRefundNotification(refund, status) {
  const notification = refundNotifications[status];
  
  if (notification) {
    await sendMultiChannelNotification({
      userId: refund.customer_id,
      templates: notification,
      data: {
        refundId: refund.id,
        orderId: refund.order_id,
        amount: refund.net_refund_amount,
        method: refund.refund_method,
        estimatedCompletion: refund.estimated_completion
      }
    });
  }
}
```

### **8. Dispute Resolution**

#### Refund Dispute Process
```javascript
async function createRefundDispute(refundId, disputeReason) {
  const refund = await getRefund(refundId);
  
  // Create dispute record
  const dispute = await createDispute({
    refundId,
    customerId: refund.customer_id,
    reason: disputeReason,
    status: 'open'
  });
  
  // Notify admin team
  await notifyAdminTeam('refund_dispute_created', {
    disputeId: dispute.id,
    refundId: refundId,
    customerId: refund.customer_id,
    amount: refund.net_refund_amount
  });
  
  // Update refund status
  await updateRefundStatus(refundId, 'pending', {
    dispute_id: dispute.id
  });
  
  return dispute;
}

async function resolveRefundDispute(disputeId, resolution, resolvedBy) {
  const dispute = await getDispute(disputeId);
  const refund = await getRefund(dispute.refund_id);
  
  // Apply resolution
  if (resolution.action === 'approve') {
    // Process additional refund if needed
    if (resolution.additionalAmount > 0) {
      await processAdditionalRefund(refund, resolution.additionalAmount);
    }
    
    // Update dispute
    await updateDispute(disputeId, {
      status: 'approved',
      resolution: resolution.notes,
      resolved_by: resolvedBy,
      resolved_at: new Date()
    });
    
    // Update refund status
    await updateRefundStatus(refund.id, 'completed');
  } else {
    // Reject dispute
    await updateDispute(disputeId, {
      status: 'rejected',
      resolution: resolution.notes,
      resolved_by: resolvedBy,
      resolved_at: new Date()
    });
    
    await updateRefundStatus(refund.id, 'failed');
  }
  
  // Notify customer
  await sendDisputeResolutionNotification(dispute, resolution);
}
```

### **9. Analytics & Reporting**

#### Refund Metrics
```javascript
const refundAnalytics = {
  // Refund rate by business
  refundRateByBusiness: async (dateRange) => {
    return await db.query(`
      SELECT 
        b.business_name,
        COUNT(o.id) as total_orders,
        COUNT(r.id) as refund_count,
        (COUNT(r.id) * 100.0 / COUNT(o.id)) as refund_rate,
        AVG(r.refund_amount) as avg_refund_amount
      FROM orders o
      LEFT JOIN refunds r ON o.id = r.order_id
      JOIN business_profiles b ON o.business_id = b.user_id
      WHERE o.placed_at BETWEEN $1 AND $2
      GROUP BY b.business_name
      ORDER BY refund_rate DESC
    `, [dateRange.start, dateRange.end]);
  },
  
  // Refund reasons analysis
  refundReasonsAnalysis: async (dateRange) => {
    return await db.query(`
      SELECT 
        refund_reason,
        COUNT(*) as count,
        AVG(refund_amount) as avg_amount,
        SUM(refund_amount) as total_amount
      FROM refunds
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY refund_reason
      ORDER BY count DESC
    `, [dateRange.start, dateRange.end]);
  },
  
  // Refund processing time
  refundProcessingTime: async (dateRange) => {
    return await db.query(`
      SELECT 
        refund_method,
        AVG(processed_at - created_at) as avg_processing_time,
        COUNT(*) as count
      FROM refunds
      WHERE status = 'completed'
        AND created_at BETWEEN $1 AND $2
        AND processed_at IS NOT NULL
      GROUP BY refund_method
    `, [dateRange.start, dateRange.end]);
  }
};
```

### **10. Customer Experience**

#### Refund Status Tracking
```javascript
// Customer can track refund status in real-time
async function getRefundStatusForCustomer(customerId, refundId) {
  const refund = await getRefund(refundId);
  
  // Verify ownership
  if (refund.customer_id !== customerId) {
    throw new Error('Unauthorized access to refund information');
  }
  
  return {
    refundId: refund.id,
    orderId: refund.order_id,
    amount: refund.net_refund_amount,
    status: refund.status,
    method: refund.refund_method,
    createdAt: refund.created_at,
    processedAt: refund.processed_at,
    estimatedCompletion: refund.estimated_completion,
    trackingInfo: await getRefundTrackingInfo(refund)
  };
}

// Refund tracking information
async function getRefundTrackingInfo(refund) {
  switch (refund.refund_method) {
    case 'original_payment_method':
      return {
        provider: getPaymentProviderName(refund.original_payment_id),
        providerRefundId: refund.provider_refund_id,
        estimatedCompletion: refund.estimated_completion
      };
      
    case 'wallet_credit':
      return {
        walletId: await getCustomerWallet(refund.customer_id),
        completedAt: refund.processed_at
      };
      
    case 'bank_transfer':
      return {
        transferId: refund.provider_refund_id,
        estimatedCompletion: refund.estimated_completion
      };
      
    case 'store_credit':
      return {
        creditAmount: refund.net_refund_amount,
        expiresAt: await getStoreCreditExpiry(refund.customer_id, refund.id)
      };
      
    default:
      return {};
  }
}
```

## Refund Flow Summary

### **Customer Experience**
1. **Instant Cancellation**: Cancel order with one click
2. **Clear Refund Policy**: See refund amount before confirming
3. **Multiple Refund Methods**: Choose preferred refund method
4. **Real-time Tracking**: Monitor refund status in app
5. **Instant Options**: Wallet credit and store credit available immediately

### **Business Benefits**
1. **Automated Processing**: Reduces manual intervention
2. **Policy Flexibility**: Customizable refund policies per business
3. **Fraud Prevention**: Built-in security and validation
4. **Analytics**: Detailed refund insights and trends
5. **Customer Satisfaction**: Fast, transparent refund process

### **System Advantages**
1. **Reliability**: Fallback mechanisms ensure refunds always process
2. **Scalability**: Handles high volume of refund requests
3. **Compliance**: Meets payment processing regulations
4. **Audit Trail**: Complete transaction history
5. **Dispute Resolution**: Structured process for refund disputes

This comprehensive refund system ensures customers receive their money back quickly and securely when orders are cancelled, while maintaining business flexibility and system reliability.
