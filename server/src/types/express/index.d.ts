import { User } from '@prisma/client'; // Pastikan ini diimpor jika kamu menggunakan User

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
      };
    }
  }
}

export {};
