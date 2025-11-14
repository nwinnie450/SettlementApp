# SettlementApp Backend API

Backend API for the SettlementApp - expense tracking and settlement application.

## Tech Stack

- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type safety
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file (already created) with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires auth)
- `PUT /profile` - Update user profile (requires auth)

### Groups (`/api/groups`)
- `GET /` - Get all user's groups
- `POST /` - Create new group
- `GET /:id` - Get group by ID
- `PUT /:id` - Update group
- `DELETE /:id` - Delete group
- `POST /join` - Join group via invite code
- `POST /:id/members` - Add member to group
- `DELETE /:id/members/:userId` - Remove member

### Expenses (`/api/expenses`)
- `GET /group/:groupId` - Get all expenses for group
- `POST /` - Create new expense
- `GET /:id` - Get expense by ID
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

### Settlements (`/api/settlements`)
- `GET /group/:groupId/balances` - Calculate balances for group
- `GET /group/:groupId` - Get all settlements for group
- `POST /` - Create settlement record
- `PUT /:id/mark-paid` - Mark settlement as paid
- `DELETE /:id` - Delete settlement

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── User.ts           # User schema
│   │   ├── Group.ts          # Group schema
│   │   ├── Expense.ts        # Expense schema
│   │   └── Settlement.ts     # Settlement schema
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   ├── groups.ts         # Group endpoints
│   │   ├── expenses.ts       # Expense endpoints
│   │   └── settlements.ts    # Settlement endpoints
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── errorHandler.ts  # Error handling
│   └── server.ts             # Express app
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## Development

- Run in development mode with hot reload:
```bash
npm run dev
```

- The server runs on `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Database Collections

- **users** - User accounts
- **groups** - Expense groups
- **expenses** - Individual expenses
- **settlements** - Payment settlements

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Error handling middleware
