const dns = require('dns').promises;
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...\n');

  const connectionString = 'mongodb+srv://winniengiew:Password999@settlement.r9uvxfi.mongodb.net/?appName=settlement';

  // Test 1: DNS resolution
  console.log('Test 1: Checking DNS resolution for settlement.r9uvxfi.mongodb.net');
  try {
    const addresses = await dns.resolve4('settlement.r9uvxfi.mongodb.net');
    console.log('✅ DNS resolved to:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }

  // Test 2: SRV record lookup
  console.log('\nTest 2: Checking MongoDB SRV records');
  try {
    const srvRecords = await dns.resolveSrv('_mongodb._tcp.settlement.r9uvxfi.mongodb.net');
    console.log('✅ SRV records found:', srvRecords);
  } catch (error) {
    console.log('❌ SRV lookup failed:', error.message);
    console.log('   This usually means:');
    console.log('   - The MongoDB cluster doesn\'t exist');
    console.log('   - The cluster is paused/suspended');
    console.log('   - The hostname in the connection string is incorrect');
  }

  // Test 3: Try to connect with mongoose
  console.log('\nTest 3: Attempting mongoose connection...');
  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Mongoose connection failed:', error.message);
  }

  process.exit(0);
}

testConnection();
