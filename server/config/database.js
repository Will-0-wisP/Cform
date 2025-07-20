import mongoose from 'mongoose';

let isConnected; // ✅ Track the connection across invocations (for Vercel)

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = conn.connections[0].readyState; // ✅ Cache the connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    if (process.env.NODE_ENV === 'development' && !process.listenerCount('SIGINT')) {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
