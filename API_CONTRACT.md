# API Contract - Delivery Platform Backend

**Base URL (local dev):** `http://localhost:3001`

---

## Authentication

### Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `409 Conflict` - Email already in use
- `400 Bad Request` - Validation errors

---

### Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid email or password

---

## Protected Endpoints

For all protected endpoints, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

---

## Realtime (Socket.io)

### Connection
**URL:** `http://localhost:3001`  
**Path:** `/socket.io`

**Authentication:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  path: '/socket.io',
  auth: {
    token: accessToken // JWT from login/register
  }
});
```

**Connection Events:**
- `connect` - Successfully connected
- `disconnect` - Disconnected from server

---

### Automatic Room Subscriptions
Upon successful connection, the server automatically subscribes you to:
- `user:<userId>` - Personal user room
- `role:<userRole>` - Role-based room (customer/driver/business_owner/admin)

---

### Available Events

#### Join Order Room
**Event:** `order:join`  
**Payload:** `orderId` (string)

```javascript
socket.emit('order:join', 'order-uuid-here');
```

Subscribes you to `order:<orderId>` room to receive real-time order updates.

---

#### Leave Order Room
**Event:** `order:leave`  
**Payload:** `orderId` (string)

```javascript
socket.emit('order:leave', 'order-uuid-here');
```

Unsubscribes you from the order room.

---

## Error Format

All API errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Or for validation errors:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

---

## User Roles

- `customer` - Default role for new users
- `business_owner` - Restaurant/merchant owner
- `driver` - Delivery driver
- `admin` - Platform administrator

---

## Database Models (Reference)

### User
- `id` (UUID)
- `email` (unique)
- `phone` (unique, optional)
- `firstName`
- `lastName`
- `role` (customer | business_owner | driver | admin)
- `status` (active | inactive | suspended | deleted)
- `emailVerified` (boolean)
- `phoneVerified` (boolean)

### Order Status Flow
```
pending → accepted → preparing → ready → picked_up → in_transit → delivered
                ↓
            cancelled/refunded
```

---

## Development Setup (for frontend devs)

### Prerequisites
- Docker Desktop running
- Backend repo cloned

### Start Backend Locally
```bash
# From repo root
docker compose up -d

# From backend folder
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend will be available at `http://localhost:3001`

---

## Next Steps (Backend TODO)

The following endpoints are **not yet implemented** but are planned:

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status
- Business/menu management endpoints
- Driver location tracking endpoints
- Payment/wallet endpoints

Frontend can start building UI/navigation now and mock these endpoints until they're ready.

---

## Contact

Backend issues/questions: [Your contact info]  
Frontend lead: [Friend's contact info]

**Last updated:** Feb 6, 2026
