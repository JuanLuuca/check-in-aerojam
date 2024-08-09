import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://juancorrea:PLRPr6wp@check-in-system-cluster.eiosslj.mongodb.net/";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & { mongoose: MongooseCache };

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      ssl: true,
    }).then((mongoose) => {
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
