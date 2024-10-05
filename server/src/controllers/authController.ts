import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendResetPasswordEmail } from "../utils/emailUtils";
import { jwtSecret } from "../utils/jwtUtils";

const prisma = new PrismaClient();

// Konstanta untuk default avatar
const DEFAULT_AVATAR_URL = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg";

// Fungsi untuk generate JWT
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "1h" });
};

// Fungsi reusable untuk hash password
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// REGISTER
export const register = async (req: Request, res: Response) => {
    const { email, username, password, avatar, bio } = req.body;

    // Log the incoming request body for debugging
    console.log("Request body:", req.body);

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email or username already in use" });
      }

      const hashedPassword = await hashPassword(password);
      const userAvatar = avatar || DEFAULT_AVATAR_URL;
      const userBio = bio || null;

      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          fullName: `user_${Math.floor(Math.random() * 100000)}`, // Correct usage
          avatar: userAvatar,
          bio: userBio
        },
      });

      const token = generateToken(newUser.id);
      return res.status(201).json({ user: newUser, token });
    } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };


// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token JWT
    const token = generateToken(user.id);

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Buat token reset password yang berlaku selama 15 menit
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "15m",
    });

    // Kirim email reset password
    await sendResetPasswordEmail(email, token);
    return res
      .status(200)
      .json({ message: "Reset password link sent to email" });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return res.status(500).json({ error: "Error sending email" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required." });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    // Hash password baru
    const hashedPassword = await hashPassword(newPassword);

    // Update password di database
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Error resetting password:", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ error: "Token has expired. Please request a new reset link." });
    }

    return res.status(403).json({ error: "Invalid or expired token." });
  }
};
