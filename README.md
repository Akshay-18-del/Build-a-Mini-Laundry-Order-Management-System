# 🧺 Dry Cleaning Store Management System

A backend API for managing dry cleaning store operations — built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

This system allows store owners to create customer orders, automatically calculate billing based on garment type and quantity, track order status through the cleaning pipeline, and view real-time business analytics via a dashboard API.

---

## 📋 Table of Contents

- [Setup Instructions](#-setup-instructions)
- [How to Run the Project](#-how-to-run-the-project)
- [Features Implemented](#-features-implemented)
- [API Endpoints](#-api-endpoints)
- [AI Usage Report](#-ai-usage-report)
- [Tradeoffs](#-tradeoffs)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher) — [Download here](https://nodejs.org/)
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster)
- **Git** — [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/laundry-order-management-system.git
cd laundry-order-management-system
```

### 2. Install Dependencies

```bash
npm install
```

This will install the following packages:
| Package | Purpose |
|---------|---------|
| `express` | Web framework for building the REST API |
| `mongoose` | MongoDB ODM for data modeling |
| `cors` | Cross-Origin Resource Sharing middleware |
| `dotenv` | Load environment variables from `.env` |
| `uuid` | Generate unique Order IDs |
| `jsonwebtoken` | JWT-based authentication (bonus feature) |
| `nodemon` (dev) | Auto-restart server on file changes |

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/laundry
JWT_SECRET=your_secret_key_here
```

> **Note:** Replace `MONGO_URI` with your MongoDB Atlas connection string if using a cloud database.  
> If MongoDB is not available locally, the server will automatically switch to an **in-memory data store** for demonstration purposes.

### 4. Start the Server

**Development mode** (auto-restart on changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see output similar to:
```
✅ MongoDB Connected: localhost
🚀 Server is running on http://localhost:5000
```

---

## 🚀 How to Run the Project

### Starting the Backend

1. Open a terminal in the project root directory.
2. Run `npm run dev` to start the development server.
3. The API will be accessible at: **`http://localhost:5000`**

### Testing the API

You can test the API using any of the following tools:

- **[Postman](https://www.postman.com/)** — Recommended for manual testing
- **[Thunder Client](https://www.thunderclient.com/)** — VS Code extension
- **cURL** — Command-line HTTP client
- **Frontend App** — A React frontend is included in the `frontend/` directory

### Quick Test with cURL

```bash
# Health check
curl http://localhost:5000/

# Login (get JWT token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Create an order (replace <TOKEN> with the JWT from login)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "customerName": "Rahul Sharma",
    "phone": "9876543210",
    "garments": [
      { "type": "Shirt", "quantity": 3 },
      { "type": "Pants", "quantity": 2 }
    ]
  }'
```

---

## ✅ Features Implemented

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Create Order** | Accept customer details and garments, auto-calculate price per item and total bill |
| 2 | **Auto Billing** | Predefined price list — Shirt: ₹50, Pants: ₹80, Saree: ₹100 |
| 3 | **Unique Order ID** | Every order gets a UUID-based unique identifier |
| 4 | **Order Status Tracking** | Status lifecycle: `RECEIVED` → `PROCESSING` → `READY` → `DELIVERED` |
| 5 | **Filter Orders** | Filter by `status`, `customerName`, `phone`, and `garmentType` |
| 6 | **Dashboard Analytics** | Total orders, total revenue, and count of orders per status |
| 7 | **Estimated Delivery Date** | Auto-set to current date + 2 days on order creation |
| 8 | **JWT Authentication** | Basic login system with Bearer token protection on routes |
| 9 | **In-Memory Fallback** | App works without MongoDB using an in-memory data store |
| 10 | **CORS Enabled** | Frontend on different ports can communicate with the API |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login with username & password, returns JWT token |

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "_id": "user_1714233600000",
  "username": "admin",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Note:** For demo purposes, logging in with a new username/password will auto-create the account.

---

### Orders

> All order endpoints require the JWT token in the `Authorization` header:  
> `Authorization: Bearer <your_token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders` | Get all orders (with optional filters) |
| `PATCH` | `/api/orders/:id/status` | Update the status of an order |

#### POST `/api/orders` — Create Order

**Request Body:**
```json
{
  "customerName": "Priya Patel",
  "phone": "9123456789",
  "garments": [
    { "type": "Shirt", "quantity": 2 },
    { "type": "Saree", "quantity": 1 }
  ]
}
```

**Response (201 Created):**
```json
{
  "_id": "ord_1714233600000_abc123",
  "orderId": "c9b30cf5-32a1-4f8e-9a2d-...",
  "customerName": "Priya Patel",
  "phone": "9123456789",
  "garments": [
    { "type": "Shirt", "quantity": 2, "price": 100 },
    { "type": "Saree", "quantity": 1, "price": 100 }
  ],
  "totalAmount": 200,
  "status": "RECEIVED",
  "estimatedDelivery": "2026-04-29T14:00:00.000Z",
  "createdAt": "2026-04-27T14:00:00.000Z"
}
```

#### GET `/api/orders` — Get Orders with Filters

| Query Parameter | Example | Description |
|-----------------|---------|-------------|
| `status` | `?status=RECEIVED` | Filter by order status |
| `customerName` | `?customerName=Priya` | Search by customer name (case-insensitive) |
| `phone` | `?phone=9123456789` | Filter by phone number |
| `garmentType` | `?garmentType=Shirt` | Filter by garment type |

**Example:** `GET /api/orders?status=RECEIVED&garmentType=Shirt`

#### PATCH `/api/orders/:id/status` — Update Order Status

**Request Body:**
```json
{
  "status": "PROCESSING"
}
```

Valid statuses: `RECEIVED`, `PROCESSING`, `READY`, `DELIVERED`

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get business analytics summary |

**Response:**
```json
{
  "totalOrders": 15,
  "totalRevenue": 2450,
  "statusCounts": {
    "RECEIVED": 5,
    "PROCESSING": 4,
    "READY": 3,
    "DELIVERED": 3
  }
}
```

---

## 🤖 AI Usage Report

### Tools Used

| Tool | How It Was Used |
|------|----------------|
| **Antigravity (AI Coding Assistant)** | Primary tool for code generation, architecture planning, debugging, and documentation |
| **ChatGPT** | Used for understanding Mongoose schema design patterns and Express middleware concepts |

### Sample Prompts Used

1. **Architecture & Planning:**
   > *"Build a backend API for a Dry Cleaning Store Management System using Node.js, Express, and MongoDB. Include order management with auto-calculated pricing, status tracking, and a dashboard API."*

2. **Debugging:**
   > *"The Mongoose connection is failing with `options usenewurlparser, useunifiedtopology are not supported`. How do I fix this for Mongoose v7+?"*

3. **Feature Implementation:**
   > *"Add search by garment type to the GET /orders endpoint and add estimated delivery date logic that defaults to current date + 2 days."*

### What AI Generated Incorrectly / Limitations

| Issue | Description | Resolution |
|-------|-------------|------------|
| **Deprecated Mongoose Options** | AI initially used `useNewUrlParser` and `useUnifiedTopology` which are removed in Mongoose v7+ | Manually removed the deprecated options |
| **Tailwind CSS v4 Incompatibility** | AI used `@tailwind base` directives which are not valid in Tailwind CSS v4 | Replaced with `@import "tailwindcss"` and installed `@tailwindcss/postcss` |
| **MongoDB Dependency** | Backend crashed on startup when MongoDB was not running locally | Built a custom in-memory data store fallback so the app works without MongoDB |
| **PowerShell Syntax** | AI used `&&` command chaining which doesn't work in older PowerShell versions | Ran commands sequentially instead |

### What Was Improved Manually

- **In-memory fallback database** — All controllers were refactored to support dual-mode operation (MongoDB + in-memory array) so the project runs without any database setup.
- **CORS configuration** — Changed from generic `cors()` to explicit origin allowlisting for the frontend dev server.
- **Error handling** — Added more descriptive error messages and prevented the server from crashing on database connection failure.

---

## ⚖️ Tradeoffs

### Features Skipped

| Feature | Reason |
|---------|--------|
| **Password Hashing (bcrypt)** | Skipped for simplicity — plaintext passwords are used for demo. In production, bcrypt should always be used. |
| **Input Sanitization** | Basic validation is present, but production-grade sanitization (e.g., `express-validator`, `helmet`) was not implemented. |
| **Pagination** | `GET /orders` returns all results. For large datasets, cursor-based pagination should be added. |
| **Rate Limiting** | No API rate limiting — would be needed for production to prevent abuse. |
| **Unit Tests** | No automated test suite — testing was done manually via Postman and the frontend app. |

### Why These Were Skipped

These features were deprioritized to focus on **core functionality** (order CRUD, billing logic, dashboard analytics) within the available development time. The goal was to deliver a **working, demonstrable system** rather than a production-hardened deployment.

### What Would Be Improved With More Time

1. **Password hashing** with bcrypt and proper user registration flow
2. **Comprehensive test suite** using Jest and Supertest
3. **Pagination and sorting** on the orders endpoint
4. **Role-based access control** (admin vs. staff)
5. **Webhook/notification system** to alert customers when their order status changes

---

## 🔮 Future Improvements

- [ ] **Authentication Enhancements** — Add user registration, password reset, and role-based access control
- [ ] **Advanced Dashboard** — Add date-range filtering, revenue trends chart, and garment-type breakdown
- [ ] **SMS/Email Notifications** — Notify customers when their order status changes (Twilio / Nodemailer)
- [ ] **Receipt Generation** — Generate PDF receipts for completed orders
- [ ] **Deployment** — Deploy backend to Railway/Render and frontend to Vercel/Netlify
- [ ] **Mobile App** — Build a React Native companion app for customers to track their orders
- [ ] **Barcode System** — Generate QR codes for each order for easy tracking

---

## 📁 Project Structure

```
laundry-order-management-system/
├── config/
│   └── db.js                  # MongoDB connection + in-memory fallback
├── controllers/
│   ├── authController.js      # Login & token generation
│   ├── dashboardController.js # Dashboard statistics
│   └── orderController.js     # Order CRUD operations
├── middleware/
│   └── authMiddleware.js      # JWT verification middleware
├── models/
│   ├── Order.js               # Mongoose Order schema
│   └── User.js                # Mongoose User schema
├── routes/
│   ├── authRoutes.js          # /api/auth routes
│   ├── dashboardRoutes.js     # /api/dashboard routes
│   └── orderRoutes.js         # /api/orders routes
├── services/
│   └── orderService.js        # Price calculation & business logic
├── frontend/                  # React frontend (separate app)
├── .env                       # Environment variables
├── app.js                     # Express app configuration
├── server.js                  # Entry point — starts the server
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

---

## 👤 Author

**Akshay Sudani**

- 📧 Email:akshaysudani1234@gmail.com
- 💼 LinkedIn:https://www.linkedin.com/in/akshay-sudani-3874a7308
- 🐙 GitHub: https://github.com/Akshay-18-del 
---

## 📝 License

This project is built for educational and demonstration purposes.

---

> **Built with ❤️ using Node.js, Express.js, and MongoDB**
