# 🚀 FlowQueue - Complete Startup Kit

**Your Online Work Management Platform - Ready to Launch**

## 📋 What's Included

This is a complete, production-ready starter kit for your work management platform with:

✅ **Backend API** (Node.js + Express + Prisma + PostgreSQL)
✅ **Frontend Web App** (Next.js 14 + TypeScript + Tailwind CSS)
✅ **Authentication System** (JWT-based, secure)
✅ **Role-Based Access Control** (Owner, Management, Worker, Client)
✅ **Admin Approval System** (Approve/Reject projects)
✅ **Queue Management** (Automatic project queuing)
✅ **Free Tier Tracking** (3 free projects per client)
✅ **Messaging System** (Internal and client communication)
✅ **Database Schema** (Complete with all relationships)
✅ **Deployment Guides** (Free hosting on Render + Vercel)

## 💰 Total Cost to Start: $0

Everything uses free tiers:
- Hosting: FREE (Render + Vercel)
- Database: FREE (Render PostgreSQL)
- Storage: FREE (Cloudinary 25GB)
- Email: FREE (Resend 3000/month)
- Domain: FREE subdomain (custom domain $10/year later)

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally (for development)
- Git installed
- GitHub account
- Vercel account (free)
- Render account (free)

### Installation

1. **Clone this repository**
```bash
git clone https://github.com/ganeshskadam/test.git
cd test
```

2. **Install Backend Dependencies**
```bash
cd apps/api
npm install
```

3. **Setup Database**
```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost:5432/flowqueue_dev"

# Run migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed
```

4. **Start Backend**
```bash
npm run dev
# Backend runs on http://localhost:4000
```

5. **Install Frontend Dependencies** (in new terminal)
```bash
cd apps/web
npm install
```

6. **Setup Frontend Environment**
```bash
cp .env.example .env.local
# Edit .env.local if needed (default API URL is already set)
```

7. **Start Frontend**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

8. **Login with Test Accounts**
```
Owner: owner@flowqueue.com / owner123
Manager: manager1@flowqueue.com / manager123
Worker: worker1@flowqueue.com / worker123
Client: client1@example.com / client123
```

## 📁 Project Structure

```
flowqueue/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── routes/   # API routes
│   │   │   ├── middleware/ # Auth, validation
│   │   │   ├── controllers/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── package.json
│   │
│   └── web/              # Frontend (Next.js)
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/
│       │   ├── lib/      # Utilities
│       │   └── hooks/
│       └── package.json
│
├── docs/
│   ├── DEPLOYMENT.md     # Deployment guide
│   ├── API.md           # API documentation
│   └── FEATURES.md      # Feature specifications
│
└── README.md
```

## 🚀 Deployment Guide

### Deploy Backend (Render.com - FREE)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect this repository
5. Configure:
   - **Name**: flowqueue-api
   - **Environment**: Node
   - **Build Command**: `cd apps/api && npm install && npx prisma generate`
   - **Start Command**: `cd apps/api && npm start`
   - **Plan**: FREE
6. Add Environment Variables:
   - `DATABASE_URL` (automatically provided by Render)
   - `JWT_SECRET` (generate random string)
   - `NODE_ENV=production`
7. Click "Create Web Service"

### Deploy Frontend (Vercel - FREE)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import this repository
5. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `apps/web`
6. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL
7. Click "Deploy"

## 📖 Documentation

- [Complete Feature List](./docs/FEATURES.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Business Plan](./docs/BUSINESS_PLAN.md)

## 🎓 Learning Resources

New to web development? Check out:
- [Next.js Tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started)
- [Node.js Guide](https://nodejs.org/en/docs/)

## 💡 Key Features

### Admin Approval System ⭐
- Owner reviews all submitted projects
- Can approve, reject, or request more info
- Rejection reasons sent to client
- Approved projects automatically enter queue

### Free Tier Management
- Each client gets 3 free projects
- Simple tasks always free
- Automatic tracking
- Clear UI showing remaining free projects

### Role-Based Access
- **Owner**: Full system control, approval rights
- **Management**: Assign workers, communicate with clients
- **Worker**: Complete tasks, no client contact
- **Client**: Submit projects, track progress

### Queue System
- Automatic queue positioning
- Priority levels (Low, Normal, High, Urgent)
- Estimated start times
- Visual queue status

## 🛠️ Built With

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Auth**: JWT, bcrypt
- **API**: RESTful
- **Database**: PostgreSQL with Prisma ORM

## 📞 Support

Questions? Issues?
- Open a GitHub Issue
- Check the [docs](./docs) folder
- Review the code comments

## 📄 License

MIT License - feel free to use this for your business!

## 🎉 What's Next?

1. ✅ Complete this setup
2. ✅ Deploy to production
3. ✅ Test with real projects
4. ✅ Get your first clients
5. ✅ Add payment integration (Stripe)
6. ✅ Scale your business!

---

**Built with ❤️ for entrepreneurs starting with $0**

Need help? The complete business plan and technical documentation is in the `docs` folder.

Good luck with your business! 🚀