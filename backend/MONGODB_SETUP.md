# MongoDB Connection Troubleshooting Guide

## Current Issue

❌ **DNS Resolution Failed**: The MongoDB Atlas cluster hostname `settlement.r9uvxfi.mongodb.net` cannot be found.

### Diagnostic Results:
```
Test 1: DNS resolution - FAILED
Test 2: SRV record lookup - FAILED
Test 3: Mongoose connection - FAILED
```

This indicates the MongoDB Atlas cluster either:
- Doesn't exist yet
- Was deleted
- Is paused/suspended (free tier clusters auto-pause after inactivity)
- Has an incorrect hostname

---

## Solution Options

### Option 1: Fix MongoDB Atlas Cluster (Recommended for Production)

#### Step 1: Verify Cluster Exists
1. Go to https://cloud.mongodb.com
2. Sign in with your account
3. Click **"Database"** in the left sidebar
4. Check if you see a cluster (should show as "Cluster0" or similar)

#### Step 2: Check Cluster Status
- **If cluster shows "PAUSED"**: Click the cluster name, then click "Resume"
- **If no cluster exists**: Click "Build a Database" to create a new free cluster

#### Step 3: Create/Configure Cluster (if needed)
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Cluster Name: `settlement` (or any name you prefer)
5. Click **"Create"**
6. **Wait 1-3 minutes** for cluster to deploy

#### Step 4: Create Database User
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `winniengiew` (or create new)
5. Password: Set a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

#### Step 5: Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access From Anywhere"** (or add your specific IP)
4. Click **"Confirm"**
5. **Wait 1-2 minutes** for changes to propagate

#### Step 6: Get Connection String
1. Go back to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=settlement
   ```
6. Replace `<username>` and `<password>` with your actual credentials
7. Update `backend/.env` file with this connection string

---

### Option 2: Use Local MongoDB (Quick Setup for Development)

#### Install MongoDB Locally

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Ubuntu/Debian:**
```bash
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Run installer with default settings
- MongoDB Compass will also be installed (GUI tool)

#### Update Connection String for Local MongoDB

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/settlementapp
```

Then restart your backend server.

---

### Option 3: Use MongoDB with Docker (Easiest)

Create `backend/docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: settlement-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Run MongoDB:
```bash
cd backend
docker-compose up -d
```

Update `backend/.env`:
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/settlementapp?authSource=admin
```

---

## Verify Connection Works

After updating your connection string, run:
```bash
cd backend
node test-connection.js
```

You should see:
```
✅ DNS resolved to: [...]
✅ SRV records found: [...]
✅ MongoDB connected successfully!
```

Then start your backend:
```bash
npm run dev
```

---

## Current Backend Status

- ✅ Backend code is complete and ready
- ✅ All API routes implemented
- ✅ Authentication system ready
- ❌ **Waiting for MongoDB connection to be fixed**

Once MongoDB is connected, the backend will be fully functional!
