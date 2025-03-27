import mongoose from 'mongoose';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';

AdminJS.registerAdapter({ Database, Resource });

const initialize = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    const db = await mongoose.connect(databaseUrl, {
      dbName: 'admin-api',
    });
    
    return { db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default initialize;
