import mongoose from 'mongoose';

// Single shared Mongoose connection, cached on the Node global so Next.js hot
// reload (dev) and serverless-style re-entry don't open a new connection on
// every request. Same database as before — data is untouched.

const DATABASE_URL = process.env.DATABASE_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose || { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      dbName: 'mydatabase',
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
