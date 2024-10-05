import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

// Rute untuk register user baru
router.post('/register', register);

// Rute untuk login
router.post('/login', login);

// Rute untuk lupa password
router.post('/forgot-password', forgotPassword);

// Rute untuk reset password
router.post('/reset-password', resetPassword);

export default router;
