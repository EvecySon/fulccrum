import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Auto-inject allergy & dietary info into special instructions
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: { dietaryPreferences: true, allergies: true, customAllergies: true },
    });

    let instructions = dto.specialInstructions || '';
    const allergyParts: string[] = [];
    if (customer?.allergies?.length) {
      allergyParts.push(`ALLERGIES: ${customer.allergies.join(', ')}`);
    }
    if (customer?.customAllergies) {
      allergyParts.push(`OTHER ALLERGIES: ${customer.customAllergies}`);
    }
    if (customer?.dietaryPreferences?.length) {
      allergyParts.push(`DIETARY: ${customer.dietaryPreferences.join(', ')}`);
    }
    if (allergyParts.length) {
      const allergyNote = `⚠️ ${allergyParts.join(' | ')}`;
      instructions = instructions ? `${instructions}\n${allergyNote}` : allergyNote;
    }

    // Determine initial status based on scheduledFor and fulfillmentType
    let initialStatus: any = 'pending';
    if (dto.scheduledFor) {
      initialStatus = 'scheduled';
    }

    // For pickup orders, set deliveryFee to 0
    const fulfillmentType = dto.fulfillmentType || 'delivery';
    const deliveryFee = fulfillmentType === 'pickup' ? 0 : dto.deliveryFee;

    // Use transaction to ensure stock validation and order creation are atomic
    const order = await this.prisma.$transaction(async (tx) => {
      // Step 1: Validate stock availability for all items
      for (const item of dto.items || []) {
        // Check if item is available
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { id: true, name: true, isAvailable: true },
        });

        if (!menuItem) {
          throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
        }

        if (!menuItem.isAvailable) {
          throw new BadRequestException(`${menuItem.name} is currently unavailable`);
        }

        // Check inventory with row-level locking to prevent race conditions
        const inventory = await tx.inventory.findUnique({
          where: { itemId: item.menuItemId },
        });

        if (inventory) {
          // If stock tracking is enabled, validate and decrement
          if (inventory.currentStock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${menuItem.name}. Only ${inventory.currentStock} available.`
            );
          }

          // Decrement stock atomically
          await tx.inventory.update({
            where: { itemId: item.menuItemId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          // Auto-mark item as unavailable if stock reaches 0
          const updatedInventory = await tx.inventory.findUnique({
            where: { itemId: item.menuItemId },
            select: { currentStock: true },
          });

          if (updatedInventory && updatedInventory.currentStock <= 0) {
            await tx.menuItem.update({
              where: { id: item.menuItemId },
              data: { isAvailable: false },
            });
          }
        }
      }

      // Step 2: Create the order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          businessId: dto.businessId,
          status: initialStatus,
          subtotal: dto.subtotal,
          deliveryFee,
          serviceFee: dto.serviceFee,
          taxAmount: dto.taxAmount,
          tipAmount: dto.tipAmount || 0,
          discountAmount: dto.discountAmount || 0,
          totalAmount: dto.totalAmount,
          specialInstructions: instructions || undefined,
          paymentMethod: dto.paymentMethod,
          paymentStatus: 'pending',
          deliveryAddressId: dto.deliveryAddressId || undefined,
          scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
          fulfillmentType,
          deliveryOption: dto.deliveryOption || undefined,
          deliveryNote: dto.deliveryNote || undefined,
          items: {
            create: (dto.items || []).map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              modifiers: item.modifiers || undefined,
              notes: item.notes || undefined,
            })),
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              menuItem: { select: { id: true, name: true, images: true } },
            },
          },
        },
      });

      return createdOrder;
    });

    // Push new order to merchant via WebSocket
    this.realtimeGateway.emitNewOrderToMerchant(order.businessId, order);

    return order;
  }

  async payWithWallet(userId: string, orderId: string) {
    // Get order details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('You can only pay for your own orders');
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order already paid');
    }

    // Get customer wallet balance
    const wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found. Please create a wallet first.');
    }

    const availableBalance = Number(wallet.balance) - Number(wallet.frozenBalance);
    const orderTotal = Number(order.totalAmount);

    if (availableBalance < orderTotal) {
      throw new BadRequestException(
        `Insufficient wallet balance. Available: ₦${availableBalance.toFixed(2)}, Required: ₦${orderTotal.toFixed(2)}`
      );
    }

    // Calculate platform fee (2% of total)
    const platformFeePercentage = 2;
    const platformFee = (orderTotal * platformFeePercentage) / 100;
    const merchantEarnings = Number(order.subtotal) - platformFee;

    // Process payment in transaction
    await this.prisma.$transaction(async (tx) => {
      // Debit customer wallet
      await tx.digitalWallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: orderTotal,
          },
        },
      });

      // Credit merchant wallet
      const merchantWallet = await tx.digitalWallet.findUnique({
        where: { userId: order.businessId },
      });

      if (!merchantWallet) {
        await tx.digitalWallet.create({
          data: {
            userId: order.businessId,
            balance: merchantEarnings,
          },
        });
      } else {
        await tx.digitalWallet.update({
          where: { userId: order.businessId },
          data: {
            balance: {
              increment: merchantEarnings,
            },
          },
        });
      }

      // Update order payment status
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          paymentMethod: 'wallet',
        },
      });
    });

    console.log(`[WALLET PAYMENT] Order #${order.orderNumber} paid via wallet`);
    console.log(`[WALLET PAYMENT] Customer wallet debited: ₦${orderTotal.toFixed(2)}`);
    console.log(`[WALLET PAYMENT] Merchant wallet credited: ₦${merchantEarnings.toFixed(2)}`);
    console.log(`[WALLET PAYMENT] Platform fee: ₦${platformFee.toFixed(2)}`);
    console.log(`[WALLET PAYMENT] Driver will be credited ₦${order.deliveryFee} on delivery`);

    return {
      success: true,
      message: 'Payment successful',
      orderNumber: order.orderNumber,
      amountPaid: orderTotal,
      paymentMethod: 'wallet',
      merchantEarnings,
      platformFee,
    };
  }

  async getOrder(orderId: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        business: {
          select: {
            userId: true,
            businessName: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== 'admin' && order.customerId !== userId && order.driverId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== 'admin' && userRole !== 'business_owner' && userRole !== 'driver') {
      throw new ForbiddenException('Only business owners, drivers, or admins can update order status');
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (dto.status === 'preparing') {
      updateData.preparationStartedAt = new Date();
    } else if (dto.status === 'ready') {
      updateData.readyAt = new Date();
    } else if (dto.status === 'picked_up') {
      updateData.pickedUpAt = new Date();
      if (dto.driverId) {
        updateData.driverId = dto.driverId;
      }
    } else if (dto.status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'completed';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (dto.status === 'delivered') {
      await this.walletService.creditOrderEarnings(
        updatedOrder.id,
        updatedOrder.businessId,
        updatedOrder.driverId,
        Number(updatedOrder.totalAmount),
        Number(updatedOrder.deliveryFee),
      );
    }

    this.realtimeGateway.emitOrderUpdate(updatedOrder.id, dto.status, {
      orderNumber: updatedOrder.orderNumber,
      customer: updatedOrder.customer,
      driver: updatedOrder.driver,
    });

    // Push status change to merchant via WebSocket
    this.realtimeGateway.emitOrderStatusToMerchant(updatedOrder.businessId, updatedOrder.id, dto.status, {
      orderNumber: updatedOrder.orderNumber,
    });

    return updatedOrder;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        business: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    // Use transaction to restore stock and cancel order atomically
    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      // Restore stock for all items in the order
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { itemId: item.menuItemId },
        });

        if (inventory) {
          // Increment stock back
          await tx.inventory.update({
            where: { itemId: item.menuItemId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });

          // Re-enable item if it was disabled due to stock
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: { isAvailable: true },
          });
        }
      }

      // Cancel the order
      return await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          paymentStatus: 'refunded',
        },
      });
    });

    this.realtimeGateway.emitOrderUpdate(orderId, 'cancelled', {
      orderNumber: cancelledOrder.orderNumber,
      reason,
    });

    console.log(`[ORDER] Order ${orderId} cancelled by user ${userId}`);
    if (reason) {
      console.log(`[ORDER] Cancellation reason: ${reason}`);
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    };
  }

  async reorder(orderId: string, customerId: string) {
    const originalOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!originalOrder) {
      throw new NotFoundException('Order not found');
    }

    if (originalOrder.customerId !== customerId) {
      throw new ForbiddenException('You can only reorder your own orders');
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newOrder = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        businessId: originalOrder.businessId,
        status: 'pending',
        subtotal: originalOrder.subtotal,
        deliveryFee: originalOrder.deliveryFee,
        serviceFee: originalOrder.serviceFee,
        taxAmount: originalOrder.taxAmount,
        tipAmount: 0,
        discountAmount: 0,
        totalAmount: originalOrder.subtotal.add(originalOrder.deliveryFee).add(originalOrder.serviceFee).add(originalOrder.taxAmount),
        paymentMethod: originalOrder.paymentMethod,
        paymentStatus: 'pending',
        specialInstructions: originalOrder.specialInstructions,
        items: {
          create: originalOrder.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            modifiers: item.modifiers,
            notes: item.notes || undefined,
          })) as any,
        },
      },
      include: {
        items: true,
        business: true,
      },
    });

    console.log(`[ORDER] Reordered ${orderId} as ${newOrder.id}`);

    return {
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    };
  }

  async getCustomerOrders(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          deliveredAt: true,
          estimatedDeliveryTime: true,
          businessId: true,
          business: {
            select: {
              userId: true,
              businessName: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              menuItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDriverOrders(driverId: string, status?: string) {
    const where: any = { driverId };
    
    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return orders;
  }

  async getBusinessOrders(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where: { businessId } }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async assignDriver(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'ready') {
      throw new ForbiddenException('Order must be ready before assigning a driver');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        status: 'picked_up',
        pickedUpAt: new Date(),
      },
    });
  }

  async getAvailableDeliveries(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: 'ready',
          driverId: null,
        },
        skip,
        take: limit,
        include: {
          business: {
            select: {
              businessName: true,
              phone: true,
              addresses: {
                take: 1,
                select: {
                  streetAddress: true,
                  city: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { readyAt: 'asc' },
      }),
      this.prisma.order.count({
        where: {
          status: 'ready',
          driverId: null,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addTip(orderId: string, customerId: string, amount: number) {
    // Validate order exists and belongs to customer
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only tip your own orders');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Can only tip delivered orders');
    }

    if (amount <= 0) {
      throw new BadRequestException('Tip amount must be greater than 0');
    }

    // Update order with tip amount
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        tipAmount: { increment: amount },
        totalAmount: { increment: amount },
      },
    });

    // Credit courier's wallet if driver exists
    if (order.driverId) {
      await this.walletService.creditWallet(order.driverId, amount, 'tip', `Tip from order ${order.orderNumber}`);
    }

    return {
      message: 'Tip added successfully',
      order: updatedOrder,
    };
  }

  async getReceipt(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: {
          select: {
            businessName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only view your own receipts');
    }

    return {
      orderNumber: order.orderNumber,
      restaurant: order.business.businessName,
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.totalPrice),
      })),
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      serviceFee: Number(order.serviceFee),
      tax: Number(order.taxAmount),
      tip: Number(order.tipAmount),
      discount: Number(order.discountAmount),
      total: Number(order.totalAmount),
      paymentMethod: order.paymentMethod || 'wallet',
      deliveredAt: order.deliveredAt,
      deliveryAddress: order.deliveryAddress ? `${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.city}` : null,
    };
  }
}
