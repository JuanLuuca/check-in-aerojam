// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';

export const getUserIdFromToken = (token: string | undefined): string | null => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
