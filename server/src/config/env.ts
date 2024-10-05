import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
export const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
export const EMAIL_PASS = process.env.EMAIL_PASS || 'your-email-password';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
