# 🛒 CampusCart — College Marketplace

A **full-stack MERN** marketplace for verified college students to **buy, sell, and borrow** items within their own campus.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account (for images)
- Stripe account (for payments, optional)

### 1. Setup Backend
```bash
cd server
# Edit .env with your credentials
npm run dev
```

### 2. Setup Frontend
```bash
cd client
npm run dev
```

### 3. Open App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

---

## ⚙️ Environment Variables (server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campuscart
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Images | Cloudinary |
| Payments | Stripe |

---

## 📁 Project Structure

```
campuscart/
├── server/             # Express backend
│   ├── config/         # DB & Cloudinary
│   ├── controllers/
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── socket/         # Socket.io handlers
└── client/             # React frontend
    └── src/
        ├── components/ # Reusable UI
        ├── context/    # Auth & Socket contexts
        ├── pages/      # All route pages
        └── services/   # Axios API service
```

---

## ✨ Features

- 🔐 JWT Authentication with college email
- 🏠 Premium landing page with animations
- 🛒 Buy: browse, search, filter, paginate
- 💰 Sell: multi-image upload, edit/delete
- 🔄 Borrow: rent items, request system, date picker
- 💬 Real-time chat (Socket.io)
- 💳 Stripe payments for buy & borrow
- 🔔 Real-time notifications
- ⭐ Star rating & review system
- 👤 User profiles + verified badge
- 📱 Mobile-first responsive design
