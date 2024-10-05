import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendResetPasswordEmail } from '../utils/emailUtils';
import { jwtSecret } from '../utils/jwtUtils';

const prisma = new PrismaClient();

// Register logic
export const registerUser = async (data: any) => {
  const { email, username, password, avatar, bio } = data;

  // Validasi, hashing password, dll. bisa dimasukkan di sini
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      avatar,
      bio,
    },
  });

  const token = jwt.sign({ userId: newUser.id }, jwtSecret, { expiresIn: '1h' });
  return { user: newUser, token };
};

// Login logic
export const loginUser = async (data: any) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
  return token;
};

// Forgot password logic
export const sendResetPasswordLink = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '15m' });
  await sendResetPasswordEmail(email, token);
};

// Reset password logic
export const updatePassword = async (data: any) => {
  const { token, newPassword } = data;
  const decoded = jwt.verify(token, jwtSecret) as { userId: number };
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });
};
