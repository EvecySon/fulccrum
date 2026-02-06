# Delivery Platform Backend

NestJS-based backend API for a multi-app delivery platform (customer, merchant, driver, admin).

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache/Queue:** Redis
- **Realtime:** Socket.io
- **Auth:** JWT (access tokens)

---

## Prerequisites

- **Node.js** v18+ (v22 recommended)
- **Docker Desktop** (for local Postgres + Redis)
- **npm** or **yarn**

---

## Local Development Setup

### 1. Start Database Services

From **repo root** (`../`):

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

Verify containers are running:

```bash
docker ps
```

You should see `cascade_postgres` and `cascade_redis`.

---

### 2. Install Dependencies

From **backend folder**:

```bash
npm install
```

---

### 3. Configure Environment

Copy the example env file:

```bash
cp .env.example .env
```

Then edit `.env` and set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cascade_dev?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

**Important:** Never commit `.env` to Git. Only commit `.env.example`.

---

### 4. Generate Prisma Client & Run Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

This creates the database tables based on `prisma/schema.prisma`.

---

### 5. Start Development Server

```bash
npm run start:dev
```

Backend will be available at:

- **API:** `http://localhost:3001`
- **Socket.io:** `http://localhost:3001/socket.io`

You should see:

```
[Nest] LOG [NestApplication] Nest application successfully started
```

---

## Available Scripts

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
npm run test:e2e
npm run test:cov

# Lint & format
npm run lint
npm run format
```

---

## Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/            # Migration history
├── src/
│   ├── auth/                  # Authentication (JWT, register, login)
│   ├── users/                 # User management
│   ├── prisma/                # Prisma service (DB connection)
│   ├── realtime/              # Socket.io gateway
│   ├── app.module.ts          # Root module
│   └── main.ts                # Entry point
├── .env                       # Local config (gitignored)
├── .env.example               # Example config (committed)
└── package.json
```

---

## API Endpoints

See **[API_CONTRACT.md](../API_CONTRACT.md)** in repo root for full API documentation.

### Quick Reference

- `POST /auth/register` - Create new user
- `POST /auth/login` - Login and get JWT
- `GET /` - Health check

---

## Database Models

Core models (see `prisma/schema.prisma`):

- **User** - All platform users (customers, drivers, merchants, admins)
- **CustomerProfile** - Customer-specific data
- **DriverProfile** - Driver-specific data (vehicle, license, etc.)
- **BusinessProfile** - Merchant/restaurant data
- **Address** - User and business addresses
- **Order** - Order lifecycle and tracking

---

## Realtime (Socket.io)

Connect with JWT authentication:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: accessToken }
});

// Join order room
socket.emit('order:join', orderId);
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for signing JWTs | Required |
| `JWT_EXPIRES_IN` | Token expiration | `1h` |
| `PORT` | Server port | `3000` |

---

## Troubleshooting

### Port already in use

Change `PORT` in `.env` or kill the process:

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Prisma Client not found

Regenerate the client:

```bash
npx prisma generate
```

### Database connection errors

Ensure Docker containers are running:

```bash
docker compose up -d
docker ps
```

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Push and create a PR

---

## License

MIT
