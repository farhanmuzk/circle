// express.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // tambahkan tipe data userId
    }
  }
}