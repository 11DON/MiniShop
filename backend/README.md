# Mini Shop — Backend API

REST API built with Node.js, Fastify, and Supabase.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Fastify
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + JWT
- **Validation:** Zod
- **Language:** TypeScript

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```



### 3. Run the development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 4. Seed the database

```bash
npx tsx src/seed.ts
```

This creates 3 categories and 10 products.

## API Routes

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login → returns JWT |
| POST | /auth/forgotpassword | Public | Send password reset email |
| GET | /auth/me | User | Get current user profile |

### Products
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /products | Public | List products (search & filter) |
| GET | /products/:id | Public | Single product detail |
| POST | /products | Admin | Create product |
| PATCH | /products/:id | Admin | Update product |
| DELETE | /products/:id | Admin | Soft delete product |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /orders | User | Place an order |
| GET | /orders/my | User | Current user's orders |
| GET | /orders | Admin | All orders (paginated) |
| PATCH | /orders/:id/status | Admin | Update order status |

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@minishop.com | customer123 |
| Admin | admin@minishop.com | admin123 |

## Scripts

```bash
npm run dev      # development with hot reload
npm run build    # compile TypeScript
npm start        # run compiled output
```