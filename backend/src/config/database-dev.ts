import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if we should use in-memory MongoDB for development
    const useMemoryDb = process.env.USE_MEMORY_DB === 'true' || !process.env.MONGODB_URI;

    let mongoUri: string;

    if (useMemoryDb) {
      console.log('🔧 Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB started');
      console.log('📍 URI:', mongoUri);
    } else {
      mongoUri = process.env.MONGODB_URI!;
      console.log('🔗 Connecting to MongoDB Atlas...');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'connected'}`);
    console.log('');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
      console.log('🛑 In-memory MongoDB stopped');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
    throw error;
  }
};

// Handle MongoDB disconnect events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});
