# FULCCRUM Backend API & Database Schema Design

## Database Architecture

### Database Selection Strategy
- **PostgreSQL**: Primary relational database (users, orders, businesses)
- **Redis**: Caching, sessions, real-time data, queues
- **MongoDB**: Analytics logs, unstructured data, time-series
- **Elasticsearch**: Search indexing and full-text search

## Core Database Schema

### 1. Users & Authentication

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'driver', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- User Profiles
CREATE TABLE customer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_address_id UUID,
    preferences JSONB DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE driver_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(30),
    license_plate VARCHAR(20),
    driver_license_number VARCHAR(50),
    background_check_status VARCHAR(20) DEFAULT 'pending',
    background_check_date TIMESTAMP WITH TIME ZONE,
    insurance_expiration DATE,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    online_status BOOLEAN DEFAULT FALSE,
    current_location POINT,
    last_location_update TIMESTAMP WITH TIME ZONE
);

CREATE TABLE business_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    business_license VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_date TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3,2) DEFAULT 5.00,
    average_preparation_time INTEGER DEFAULT 15, -- minutes
    delivery_fee DECIMAL(5,2) DEFAULT 0.00,
    minimum_order_amount DECIMAL(8,2) DEFAULT 0.00
);
```

### 2. Addresses & Locations

```sql
-- Addresses Table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    label VARCHAR(50), -- 'Home', 'Work', 'Business'
    street_address VARCHAR(255) NOT NULL,
    apartment VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Zones
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    delivery_fee DECIMAL(5,2) NOT NULL,
    minimum_order_amount DECIMAL(8,2) DEFAULT 0.00,
    estimated_delivery_time INTEGER DEFAULT 30, -- minutes
    polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Business & Menu Management

```sql
-- Business Hours
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    cost_price DECIMAL(8,2),
    images JSONB DEFAULT '[]',
    ingredients TEXT[],
    allergens TEXT[],
    nutritional_info JSONB,
    preparation_time INTEGER DEFAULT 15, -- minutes
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Modifiers
CREATE TABLE item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'multiple')),
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id UUID REFERENCES item_modifiers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(5,2) DEFAULT 0.00,
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE
);

-- Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pieces',
    cost_per_unit DECIMAL(8,2),
    supplier VARCHAR(255),
    last_restocked TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Orders & Transactions

```sql
-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Order Details
    status order_status NOT NULL DEFAULT 'pending',
    priority order_priority DEFAULT 'normal',
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(5,2) NOT NULL,
    service_fee DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(5,2) NOT NULL,
    tip_amount DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(5,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Addresses
    delivery_address_id UUID REFERENCES addresses(id),
    pickup_address_id UUID REFERENCES addresses(id),
    
    -- Timing
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    preparation_started_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Additional Info
    special_instructions TEXT,
    customer_notes TEXT,
    business_notes TEXT,
    driver_notes TEXT,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_status payment_status DEFAULT 'pending',
    payment_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums
CREATE TYPE order_status AS ENUM (
    'pending', 'accepted', 'rejected', 'preparing', 'ready', 
    'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE order_priority AS ENUM ('normal', 'urgent', 'scheduled');
CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Item Modifiers
CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_option_id UUID REFERENCES modifier_options(id),
    price_adjustment DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Payments & Financials

```sql
-- Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_payment_method_id VARCHAR(255) NOT NULL,
    last_four VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE payment_method_type AS ENUM (
    'credit_card', 'debit_card', 'apple_pay', 'google_pay', 
    'paypal', 'cash_on_delivery', 'digital_wallet'
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status transaction_status NOT NULL DEFAULT 'pending',
    provider VARCHAR(50) NOT NULL,
    provider_transaction_id VARCHAR(255),
    fee_amount DECIMAL(5,2) DEFAULT 0.00,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE transaction_type AS ENUM (
    'payment', 'refund', 'payout', 'fee', 'tip', 'adjustment'
);
CREATE TYPE transaction_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
);

-- Driver Payouts
CREATE TABLE driver_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_earnings DECIMAL(10,2) NOT NULL,
    total_fees DECIMAL(5,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    status payout_status DEFAULT 'pending',
    payout_method VARCHAR(50),
    provider_payout_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Wallets
CREATE TABLE digital_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    wallet_type wallet_type NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    frozen_balance DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_type)
);

CREATE TYPE wallet_type AS ENUM ('merchant', 'driver', 'customer');

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES digital_wallets(id) ON DELETE CASCADE,
    transaction_type wallet_transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference_id UUID, -- Order ID, Payout ID, etc.
    reference_type VARCHAR(50), -- 'order', 'payout', 'withdrawal', etc.
    description TEXT,
    status wallet_transaction_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE wallet_transaction_type AS ENUM (
    'credit', 'debit', 'withdrawal', 'deposit', 'fee', 'refund', 'freeze', 'unfreeze'
);
CREATE TYPE wallet_transaction_status AS ENUM (
    'pending', 'completed', 'failed', 'cancelled'
);

-- Withdrawal Requests
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES digital_wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status withdrawal_status DEFAULT 'pending',
    withdrawal_method VARCHAR(50) NOT NULL,
    destination_account VARCHAR(255) NOT NULL,
    confirmation_code VARCHAR(6),
    confirmation_code_expires_at TIMESTAMP WITH TIME ZONE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    provider_withdrawal_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

CREATE TYPE withdrawal_status AS ENUM (
    'pending', 'confirmed', 'processing', 'completed', 'failed', 'cancelled', 'expired'
);

-- Withdrawal Security Settings
CREATE TABLE withdrawal_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_withdrawal_limit DECIMAL(10,2) DEFAULT 10000.00,
    withdrawal_cooldown_seconds INTEGER DEFAULT 300, -- 5 minutes
    require_2fa_above_amount DECIMAL(10,2) DEFAULT 1000.00,
    require_email_confirmation BOOLEAN DEFAULT TRUE,
    require_sms_confirmation BOOLEAN DEFAULT FALSE,
    max_withdrawal_attempts_per_day INTEGER DEFAULT 5,
    auto_freeze_suspicious_amount DECIMAL(10,2) DEFAULT 50000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal Attempts Log
CREATE TABLE withdrawal_attempts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    withdrawal_request_id UUID REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255)
);

-- Refunds Table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_payment_id VARCHAR(255),
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_fee DECIMAL(5,2) DEFAULT 0.00,
    net_refund_amount DECIMAL(10,2) NOT NULL,
    refund_method refund_method NOT NULL,
    refund_reason refund_reason NOT NULL,
    status refund_status DEFAULT 'pending',
    provider_refund_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE refund_method AS ENUM (
    'original_payment_method', 'wallet_credit', 'bank_transfer', 'store_credit'
);
CREATE TYPE refund_reason AS ENUM (
    'customer_cancelled', 'merchant_cancelled', 'system_error', 'duplicate_charge', 
    'service_issue', 'quality_issue', 'late_delivery', 'wrong_items'
);
CREATE TYPE refund_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'partial'
);

-- Refund Disputes
CREATE TABLE refund_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dispute_reason TEXT NOT NULL,
    status dispute_status DEFAULT 'open',
    admin_notes TEXT,
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE dispute_status AS ENUM (
    'open', 'under_review', 'approved', 'rejected', 'escalated'
);

-- Refund Policies
CREATE TABLE refund_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES business_profiles(user_id) ON DELETE CASCADE,
    policy_name VARCHAR(100) NOT NULL,
    cancellation_time_limit INTEGER DEFAULT 900, -- seconds
    refund_percentage DECIMAL(5,2) DEFAULT 100.00,
    refund_fee DECIMAL(5,2) DEFAULT 0.00,
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Profiles for Advanced Features
ALTER TABLE customer_profiles ADD COLUMN ai_preferences JSONB DEFAULT '{}';
ALTER TABLE customer_profiles ADD COLUMN voice_profile_id UUID REFERENCES voice_profiles(id);
ALTER TABLE customer_profiles ADD COLUMN ar_preferences JSONB DEFAULT '{}';
ALTER TABLE customer_profiles ADD COLUMN social_settings JSONB DEFAULT '{}';
ALTER TABLE customer_profiles ADD COLUMN sustainability_score INTEGER DEFAULT 0;
ALTER TABLE customer_profiles ADD COLUMN crypto_wallet_address VARCHAR(100);
ALTER TABLE customer_profiles ADD COLUMN nft_collection JSONB DEFAULT '[]';

-- Enhanced Business Profiles
ALTER TABLE business_profiles ADD COLUMN ai_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE business_profiles ADD COLUMN kitchen_stations JSONB DEFAULT '[]';
ALTER TABLE business_profiles ADD COLUMN supply_chain_data JSONB DEFAULT '{}';
ALTER TABLE business_profiles ADD COLUMN sustainability_certifications JSONB DEFAULT '[]';
ALTER TABLE business_profiles ADD COLUMN multi_channel_config JSONB DEFAULT '{}';
ALTER TABLE business_profiles ADD COLUMN crm_data JSONB DEFAULT '{}';

-- Enhanced Driver Profiles
ALTER TABLE driver_profiles ADD COLUMN ai_performance_data JSONB DEFAULT '{}';
ALTER TABLE driver_profiles ADD COLUMN preferred_delivery_methods JSONB DEFAULT '[]';
ALTER TABLE driver_profiles ADD COLUMN safety_settings JSONB DEFAULT '{}';
ALTER TABLE driver_profiles ADD COLUMN gamification_data JSONB DEFAULT '{}';
ALTER TABLE driver_profiles ADD COLUMN tier_progress INTEGER DEFAULT 0;

CREATE TYPE payout_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
);
```

### 6. Ratings & Reviews

```sql
-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE, -- business or driver
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response TEXT, -- business/driver response
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Categories (for detailed feedback)
CREATE TABLE review_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Notifications & Communications

```sql
-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels notification_channel[] DEFAULT ARRAY['push'],
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM (
    'order_update', 'delivery_update', 'payment_update', 'promotion',
    'system_alert', 'support_message', 'review_request'
);
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');

-- Support Tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id), -- admin/staff
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'pending_customer', 'resolved', 'closed');

-- Support Messages
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Architecture

### RESTful API Design

```javascript
// API Base Structure
const apiStructure = {
  version: 'v1',
  baseUrl: 'https://api.deliveryplatform.com/v1',
  
  // Authentication Endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    verifyEmail: '/auth/verify-email',
    verifyPhone: '/auth/verify-phone',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  
  // User Management
  users: {
    profile: '/users/profile',
    addresses: '/users/addresses',
    paymentMethods: '/users/payment-methods',
    notifications: '/users/notifications',
    preferences: '/users/preferences'
  },
  
  // Business Management
  businesses: {
    profile: '/businesses/profile',
    menu: '/businesses/menu',
    categories: '/businesses/menu/categories',
    items: '/businesses/menu/items',
    modifiers: '/businesses/menu/modifiers',
    hours: '/businesses/hours',
    zones: '/businesses/delivery-zones',
    inventory: '/businesses/inventory',
    analytics: '/businesses/analytics'
  },
  
  // Order Management
  orders: {
    list: '/orders',
    create: '/orders',
    details: '/orders/:id',
    cancel: '/orders/:id/cancel',
    track: '/orders/:id/track',
    history: '/orders/history'
  },
  
  // Driver Management
  drivers: {
    profile: '/drivers/profile',
    location: '/drivers/location',
    earnings: '/drivers/earnings',
    payouts: '/drivers/payouts',
    performance: '/drivers/performance'
  },
  
  // Payment Processing
  payments: {
    methods: '/payments/methods',
    process: '/payments/process',
    refund: '/payments/refund',
    history: '/payments/history',
    wallet: '/payments/wallet',
    walletBalance: '/payments/wallet/balance',
    walletTransactions: '/payments/wallet/transactions',
    withdrawal: '/payments/withdrawal',
    withdrawalRequest: '/payments/withdrawal/request',
    withdrawalConfirm: '/payments/withdrawal/confirm',
    withdrawalHistory: '/payments/withdrawal/history',
    withdrawalSettings: '/payments/withdrawal/settings',
    refunds: '/payments/refunds',
    refundRequest: '/payments/refunds/request',
    refundStatus: '/payments/refunds/:id/status',
    refundDispute: '/payments/refunds/:id/dispute'
  },
  
  // Advanced AI Features
  ai: {
    recommendations: '/ai/recommendations',
    predictiveOrders: '/ai/predictive-orders',
    voiceProfile: '/ai/voice-profile',
    behaviorAnalysis: '/ai/behavior-analysis'
  },
  
  // AR/VR Features
  ar: {
    foodPreview: '/ar/food-preview/:itemId',
    restaurantTour: '/ar/restaurant-tour/:businessId',
    arNavigation: '/ar/navigation'
  },
  
  // Social Features
  social: {
    connections: '/social/connections',
    groupOrders: '/social/group-orders',
    foodPosts: '/social/posts',
    challenges: '/social/challenges'
  },
  
  // Blockchain
  blockchain: {
    supplyChain: '/blockchain/supply-chain/:itemId',
    cryptoPayment: '/blockchain/crypto-payment',
    nftRewards: '/blockchain/nft-rewards'
  },
  
  // Sustainability
  sustainability: {
    carbonFootprint: '/sustainability/carbon-footprint',
    ecoOptions: '/sustainability/eco-options',
    wasteReduction: '/sustainability/waste-reduction'
  },
  
  // Support
  support: {
    tickets: '/support/tickets',
    messages: '/support/tickets/:id/messages',
    chat: '/support/chat'
  }
};
```

### Microservices Architecture

```javascript
// Service Breakdown
const microservices = {
  userService: {
    port: 3001,
    database: 'users_db',
    responsibilities: [
      'Authentication & Authorization',
      'User Profile Management',
      'Address Management',
      'Preferences & Settings'
    ]
  },
  
  businessService: {
    port: 3002,
    database: 'business_db',
    responsibilities: [
      'Business Registration & Verification',
      'Menu Management',
      'Inventory Management',
      'Business Analytics'
    ]
  },
  
  orderService: {
    port: 3003,
    database: 'orders_db',
    responsibilities: [
      'Order Processing',
      'Order Status Management',
      'Order History',
      'Order Analytics'
    ]
  },
  
  paymentService: {
    port: 3004,
    database: 'payments_db',
    responsibilities: [
      'Payment Processing',
      'Digital Wallet Management',
      'Withdrawal Processing',
      'Security & Fraud Detection',
      'Refund Management',
      'Payout Processing',
      'Financial Reporting'
    ]
  },
  
  notificationService: {
    port: 3005,
    database: 'notifications_db',
    responsibilities: [
      'Push Notifications',
      'Email Notifications',
      'SMS Notifications',
      'In-app Notifications'
    ]
  },
  
  locationService: {
    port: 3006,
    database: 'location_db',
    responsibilities: [
      'GPS Tracking',
      'Geofencing',
      'Route Optimization',
      'Distance Calculations'
    ]
  },
  
  analyticsService: {
    port: 3007,
    database: 'analytics_db',
    responsibilities: [
      'Data Aggregation',
      'Report Generation',
      'Business Intelligence',
      'Predictive Analytics'
    ]
  }
};
```

### Real-time Communication (WebSockets)

```javascript
// WebSocket Events
const socketEvents = {
  // Customer Events
  customer: {
    orderStatusUpdate: 'order:status_update',
    driverLocationUpdate: 'order:driver_location',
    deliveryETAUpdate: 'order:eta_update',
    promotionReceived: 'promotion:new'
  },
  
  // Business Events
  business: {
    newOrderReceived: 'order:new',
    orderModification: 'order:modified',
    driverAssigned: 'order:driver_assigned',
    lowInventoryAlert: 'inventory:low'
  },
  
  // Driver Events
  driver: {
    orderOffer: 'order:offer',
    orderAssigned: 'order:assigned',
    routeUpdate: 'navigation:update',
    earningsUpdate: 'earnings:update'
  },
  
  // Admin Events
  admin: {
    systemAlert: 'system:alert',
    userActivity: 'user:activity',
    performanceMetrics: 'analytics:metrics',
    supportTicket: 'support:new_ticket'
  }
};
```

## API Security & Authentication

### JWT Token Structure
```javascript
// JWT Payload
const jwtPayload = {
  sub: 'user_id',
  role: 'customer|business_owner|driver|admin',
  permissions: ['read:profile', 'write:orders'],
  business_id: 'business_id', // for business owners
  driver_id: 'driver_id',     // for drivers
  iat: 1234567890,
  exp: 1234567890,
  iss: 'delivery-platform',
  aud: 'delivery-platform-app'
};
```

### API Rate Limiting
```javascript
// Rate Limiting Configuration
const rateLimiting = {
  customer: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    burstLimit: 20
  },
  business: {
    requestsPerMinute: 200,
    requestsPerHour: 2000,
    burstLimit: 50
  },
  driver: {
    requestsPerMinute: 150,
    requestsPerHour: 1500,
    burstLimit: 30
  },
  admin: {
    requestsPerMinute: 500,
    requestsPerHour: 5000,
    burstLimit: 100
  }
};
```

## Database Optimization

### Indexing Strategy
```sql
-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);

CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- Geospatial Indexes
CREATE INDEX idx_delivery_zones_polygon ON delivery_zones USING GIST(polygon);
CREATE INDEX idx_driver_profiles_location ON driver_profiles USING GIST(current_location);

-- Composite Indexes
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_business_created ON orders(business_id, created_at);
```

### Caching Strategy
```javascript
// Redis Caching Configuration
const cacheConfig = {
  userSessions: {
    ttl: 3600, // 1 hour
    key: 'session:{user_id}'
  },
  
  businessMenus: {
    ttl: 1800, // 30 minutes
    key: 'menu:{business_id}'
  },
  
  popularItems: {
    ttl: 7200, // 2 hours
    key: 'popular:{business_id}'
  },
  
  driverLocations: {
    ttl: 60,   // 1 minute
    key: 'driver:location:{driver_id}'
  },
  
  orderTracking: {
    ttl: 86400, // 24 hours
    key: 'order:track:{order_id}'
  }
};
```

This comprehensive backend architecture provides the foundation for a scalable, secure, and high-performance delivery platform that can handle millions of users and orders efficiently.
