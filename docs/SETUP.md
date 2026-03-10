# FlowQueue – Local Setup Guide

## Prerequisites

| Tool | Minimum Version | Install |
|------|-----------------|---------|
| Node.js | 18.x | https://nodejs.org/ |
| npm | 9.x (bundled with Node) | — |
| PostgreSQL | 14.x | https://www.postgresql.org/download/ |
| Git | any | https://git-scm.com/ |

---

## 1. Clone the Repository

```bash
git clone https://github.com/ganeshskadam/test.git flowqueue
cd flowqueue
```

---

## 2. Backend Setup (`apps/api`)

### 2a. Install Dependencies

```bash
cd apps/api
npm install
```

### 2b. Create the Database

Open a PostgreSQL shell and run:

```sql
CREATE DATABASE flowqueue_dev;
```

### 2c. Environment Variables

```bash
cp .env.example .env
```

Open `.env` and update:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/flowqueue_dev"
JWT_SECRET="any-long-random-string"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 2d. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 2e. Seed Test Data

```bash
npx ts-node prisma/seed.ts
```

This creates:

| Email | Password | Role |
|-------|----------|------|
| owner@flowqueue.com | owner123 | OWNER |
| manager1@flowqueue.com | manager123 | MANAGEMENT |
| worker1@flowqueue.com | worker123 | WORKER |
| client1@example.com | client123 | CLIENT |

### 2f. Start the Backend

```bash
npm run dev
# API running at http://localhost:4000
```

Health check: http://localhost:4000/health

---

## 3. Frontend Setup (`apps/web`)

Open a **new terminal** and run:

### 3a. Install Dependencies

```bash
cd apps/web
npm install
```

### 3b. Environment Variables

```bash
cp .env.example .env.local
```

The defaults work for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=FlowQueue
```

### 3c. Start the Frontend

```bash
npm run dev
# App running at http://localhost:3000
```

---

## 4. Verify Everything Works

1. Open http://localhost:3000
2. Log in with `owner@flowqueue.com` / `owner123`
3. You should see the dashboard
4. Navigate to **Admin → Approvals** to see the sample submitted project
5. Try approving or rejecting it

---

## Common Issues

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Migration Error
```bash
# Reset and re-migrate
npx prisma migrate reset --force
npx ts-node prisma/seed.ts
```

### Database Connection Failed
- Make sure PostgreSQL service is running: `pg_isready`
- Check your `DATABASE_URL` in `.env`
