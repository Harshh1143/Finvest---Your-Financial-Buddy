# Finvest - Your Financial Buddy (MERN Stack)

A full-stack financial dashboard application built with MongoDB, Express, React, and Node.js.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
finvest/
├── backend/           # Express API server
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth middleware
│   ├── server.js      # Entry point
│   └── .env           # Environment variables
└── frontend/          # React application
    └── src/
        ├── lib/       # API client & DB abstraction
        ├── components/# UI components
        └── pages/     # Page components
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Start MongoDB

**Local MongoDB:**
```bash
# Windows (if installed)
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 mongo
```

**MongoDB Atlas (Cloud):**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update `backend/.env` with your connection string

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

The API will run on http://localhost:5000

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will run on http://localhost:5173

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finvest
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Features

- Dashboard with financial overview
- Transaction tracking (income/expenses)
- Investment portfolio management
- Loan/debt tracking with EMI calculations
- Savings goals with progress tracking
- Monthly budget management
- Visual analytics with charts

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/transactions | List transactions |
| POST | /api/transactions | Add transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/portfolio | List portfolio assets |
| POST | /api/portfolio | Add portfolio asset |
| DELETE | /api/portfolio/:id | Delete asset |
| PATCH | /api/portfolio/:id/price | Update asset price |
| GET | /api/budgets | Get monthly budget |
| POST | /api/budgets | Set monthly budget |
| GET | /api/loans | List loans |
| POST | /api/loans | Add loan |
| POST | /api/loans/:id/pay | Pay EMI |
| DELETE | /api/loans/:id | Delete loan |
| GET | /api/savings | List savings goals |
| POST | /api/savings | Add savings goal |
| POST | /api/savings/:id/deposit | Add deposit |
| DELETE | /api/savings/:id | Delete goal |