# API Testing Guide

## Backend Server Status

✅ **Backend is RUNNING and FULLY FUNCTIONAL!**

- Server: http://localhost:5000
- Database: In-memory MongoDB (mongodb-memory-server)
- All API endpoints tested and working

---

## Quick Start

The backend is currently running. You can test it immediately:

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {
#   "status": "OK",
#   "message": "Settlement App Backend is running",
#   "timestamp": "..."
# }
```

---

## Complete API Test Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "defaultCurrency": "USD"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💾 Save the token!** You'll need it for authenticated requests.

---

### 2. Login (Alternative to Registration)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### 3. Get User Profile

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Create a Group

```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Weekend Trip",
    "baseCurrency": "USD"
  }'
```

**Response:**
```json
{
  "message": "Group created successfully",
  "group": {
    "name": "Weekend Trip",
    "baseCurrency": "USD",
    "inviteCode": "invite_...",
    "_id": "...",
    "members": [
      {
        "userId": "...",
        "name": "John Doe",
        "role": "admin"
      }
    ]
  }
}
```

**💾 Save the group `_id` and `inviteCode`!**

---

### 5. Join Group (Another User)

```bash
curl -X POST http://localhost:5000/api/groups/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ANOTHER_USER_TOKEN" \
  -d '{
    "inviteCode": "invite_..."
  }'
```

---

### 6. List User's Groups

```bash
curl -X GET http://localhost:5000/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 7. Add an Expense

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "groupId": "GROUP_ID_HERE",
    "description": "Dinner at Italian Restaurant",
    "amount": 150.00,
    "currency": "USD",
    "baseCurrencyAmount": 150.00,
    "category": "food",
    "date": "2025-11-14",
    "paidBy": "YOUR_USER_ID",
    "splits": [
      {
        "userId": "YOUR_USER_ID",
        "amount": 75.00,
        "percentage": 50
      },
      {
        "userId": "FRIEND_USER_ID",
        "amount": 75.00,
        "percentage": 50
      }
    ]
  }'
```

**Expense Categories:**
- `food` - Food & Dining
- `transport` - Transportation
- `accommodation` - Hotels & Lodging
- `entertainment` - Entertainment
- `shopping` - Shopping
- `utilities` - Utilities
- `healthcare` - Healthcare
- `education` - Education
- `groceries` - Groceries
- `other` - Other

---

### 8. List Group Expenses

```bash
curl -X GET "http://localhost:5000/api/expenses/group/GROUP_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 9. Calculate Group Balances

```bash
curl -X GET "http://localhost:5000/api/settlements/group/GROUP_ID_HERE/balances" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "balances": [
    {
      "userId": "...",
      "userName": "John Doe",
      "netAmount": 75.00,
      "currency": "USD"
    },
    {
      "userId": "...",
      "userName": "Jane Smith",
      "netAmount": -75.00,
      "currency": "USD"
    }
  ]
}
```

**Interpretation:**
- Positive `netAmount`: This person is **owed money**
- Negative `netAmount`: This person **owes money**

---

### 10. Create Settlement

```bash
curl -X POST http://localhost:5000/api/settlements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "groupId": "GROUP_ID_HERE",
    "fromUserId": "DEBTOR_USER_ID",
    "toUserId": "CREDITOR_USER_ID",
    "amount": 75.00,
    "currency": "USD"
  }'
```

---

### 11. Mark Settlement as Paid

```bash
curl -X PUT "http://localhost:5000/api/settlements/SETTLEMENT_ID/mark-paid" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 12. Update User Profile

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Updated",
    "defaultCurrency": "EUR"
  }'
```

---

## Testing with Postman/Insomnia

1. **Import Collection** (if you have one)
2. **Set Environment Variables:**
   - `baseUrl`: http://localhost:5000
   - `token`: (paste your JWT token here)
3. **Use `{{baseUrl}}` and `{{token}}` in requests**

---

## Server Management

### Check Server Status

The server is running in the background. Check logs:

```bash
# Backend logs are available via the background process
```

### Restart Server

```bash
cd backend
npm run dev
```

### Stop Server

```bash
# Use Ctrl+C in the terminal where the server is running
# Or kill the process
```

---

## Environment Configuration

The backend is currently using **in-memory MongoDB** for development.

**To switch to MongoDB Atlas** (on your local machine):

1. Edit `backend/.env`:
```env
# Comment out or remove:
# USE_MEMORY_DB=true

# Uncomment and use your MongoDB Atlas connection:
MONGODB_URI=mongodb+srv://winniengiew:Password999@settlement.r9uvxfi.mongodb.net/?retryWrites=true&w=majority&appName=settlement
```

2. Restart the server

---

## API Response Codes

- **200 OK**: Success
- **201 Created**: Resource created
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Common Issues & Solutions

### Issue: "Access token required"
**Solution:** Include the Authorization header with Bearer token

### Issue: "Invalid credentials"
**Solution:** Check email and password are correct

### Issue: "Group not found"
**Solution:** Verify the group ID exists and user is a member

### Issue: "Splits must sum to total amount"
**Solution:** Ensure all splits add up to the expense amount

---

## Next Steps

1. ✅ Backend is fully functional
2. ⏳ **Next:** Connect React frontend to backend API
3. ⏳ Replace localStorage with API calls
4. ⏳ Add authentication UI (login/register screens)
5. ⏳ Deploy backend to Railway/Render/Vercel

---

## Need Help?

- Check `backend/README.md` for detailed API documentation
- Review `backend/MONGODB_SETUP.md` for database configuration
- See `BACKEND_STATUS.md` for project overview
