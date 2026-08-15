# 🌌 Finvest - Your Premium Financial Companion

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg?style=for-the-badge)](https://mongodb.com)
[![React Version](https://img.shields.io/badge/React-19-cyan.svg?style=for-the-badge)](https://react.dev)
[![Node Version](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Finvest is a modern, premium MERN (MongoDB, Express, React, Node.js) financial operating system designed for modern money builders. It provides clean analytics, investment portfolio trackers, savings goal monitoring, loan/EMI management, and dynamic user preference localization.

---

## ✨ Features

- 📊 **Dynamic Dashboard Workspace**: Real-time stats showing Net Worth, Monthly Spending alerts, Investment Performance, and Liabilities.
- 💱 **Multi-Currency Preferences**: Seamless localization supports **USD ($)**, **EUR (€)**, **GBP (£)**, and **INR (₹)** system-wide.
- 📈 **Investment Portfolio Tracker**: Live stock/crypto valuations with automated Unrealized Profit/Loss projections.
- 🏷️ **Intelligent Budgeting**: Automated category-specific budgets with custom threshold warning triggers (e.g. warning at 80% limit).
- 💸 **Debt & EMI Planner**: Track loans, calculate principal/interest payoffs, and log extra EMI payments.
- 🎯 **Savings Architect**: Map out long-term milestones, auto-validate due dates, and chart target progress.
- 🛡️ **JWT Security Middleware**: Secure password hashing with `bcryptjs` and request validation.
- 🧹 **Danger Zone Data Purge**: Complete administrative control to wipe all account financial logs securely.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State/Query**: TanStack React Query (v5)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios (unified request interceptors)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Mongoose (MongoDB)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 📂 Project Structure

```
finvest/
├── backend/                  # Node.js/Express API server
│   ├── middleware/           # Auth and Error handling middlewares
│   ├── models/               # MongoDB Mongoose Schemas
│   ├── routes/               # API endpoints (Auth, Portfolio, etc.)
│   ├── server.js             # Express application root
│   └── .env.example          # Environment variables template
└── frontend/                 # React frontend client
    ├── src/
    │   ├── components/       # Reusable layout and UI elements
    │   │   ├── auth/         # Protected routes and forms
    │   │   ├── layout/       # App shell and sidebar navigations
    │   │   ├── modals/       # Transaction/asset addition modals
    │   │   └── ui/           # Radix/primitive styling units
    │   ├── lib/              # Client API, Axios config & currency utilities
    │   └── pages/            # Core page canvases (Dashboard, Profile, etc.)
    └── vite.config.js        # Vite configurations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB instance (Local community server or MongoDB Atlas)

---

### Step 1: Clone and Set Up Databases

#### Option A: Local MongoDB
Ensure your MongoDB daemon is running:
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name finvest-mongo mongo
```

#### Option B: MongoDB Atlas (Cloud)
1. Set up a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and capture the connection string:
   `mongodb+srv://<username>:<password>@cluster.mongodb.net/finvest`

---

### Step 2: Configure Environment Variables

Create `.env` files in both directories.

#### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_high_entropy_jwt_secret
```

#### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Run the Application

From the root repository directory, you can run services:

#### Start Backend
```bash
cd backend
npm install
npm run dev
```

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** to launch the web client.

---

## 🚀 Deployment Guide

### Backend: Deploying to Render
1. Create a **Web Service** on Render and link your GitHub repository.
2. Choose **Node** environment.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Under Environment variables, configure:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Secure string
   - `PORT`: `10000` (Render's default)

#### Keep-Alive (UptimeRobot Integration)
Render's free tier spins down instances after 15 minutes of inactivity. To keep your backend active:
- Set up an HTTP Monitor on [UptimeRobot](https://uptimerobot.com).
- Point the monitor to target your backend url health check: `https://your-service.onrender.com/health`
- Set it to ping every **5 to 10 minutes**.

---

### Frontend: Deploying to Vercel
1. Install Vercel CLI globally or use the Vercel Dashboard import tool.
2. Link your frontend workspace.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment variables:
   - `VITE_API_URL`: Your deployed Render API root (e.g. `https://your-service.onrender.com/api`)

---

## 📡 API Routing Canvas

All requests to protected routes require a `Bearer <JWT_TOKEN>` header.

### Authentication & Profile
| Method | Endpoint | Description | Public |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new profile | Yes |
| `POST` | `/api/auth/login` | Authenticate credentials | Yes |
| `GET` | `/api/auth/me` | Fetch active user credentials | No |
| `PUT` | `/api/auth/profile` | Update profile settings (currency, password) | No |
| `POST` | `/api/auth/reset-data` | Purges all financial logs from account | No |
| `GET` | `/health` | Server & Database connectivity status | Yes |

### Financial Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | List user transaction logs |
| `POST` | `/api/transactions` | Log new transaction (income/expense) |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `GET` | `/api/portfolio` | Retrieve active portfolio positions |
| `POST` | `/api/portfolio` | Record position purchase |
| `PATCH` | `/api/portfolio/:id/price` | Edit purchase or asset current unit price |
| `DELETE` | `/api/portfolio/:id` | Delete position |
| `GET` | `/api/budgets` | Fetch monthly target budget and category limits |
| `POST` | `/api/budgets` | Set global monthly budget limit |
| `POST` | `/api/budgets/categories` | Save category budget limits |
| `DELETE` | `/api/budgets/categories/:category` | Remove limit parameter for category |
| `GET` | `/api/loans` | View active liability debts |
| `POST` | `/api/loans` | Log new debt |
| `POST` | `/api/loans/:id/pay` | Record an EMI/extra payment log |
| `GET` | `/api/savings` | List savings goals |
| `POST` | `/api/savings` | Set savings milestone targets |
| `POST` | `/api/savings/:id/deposit` | Log contribution deposit to milestone |

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.