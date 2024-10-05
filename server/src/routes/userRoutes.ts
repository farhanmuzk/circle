import express from 'express';
import {
    getAllUsers,
    getCurrentUser,
    followUser,
    getFollowingUsers,
    updateUserProfile,
    getFollowersForUser,
    unfollowUser,
} from "../controllers/userController";
import { authenticateJWT } from "../middleware/auth";
import { asyncWrapper } from '../middleware/asyncWrapper';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' })


// Rute untuk mengambil semua user (bisa dijadikan public atau membutuhkan otentikasi)
router.get("/allUser", getAllUsers);

// Rute untuk mendapatkan user yang sedang login (memerlukan otentikasi)
router.get("/me", getCurrentUser);


// Rute untuk memperbarui data user (memerlukan otentikasi)
router.put("/:id", asyncWrapper(authenticateJWT), upload.single('avatar'), updateUserProfile);

// Rute untuk mengikuti atau berhenti mengikuti user lain (memerlukan otentikasi)
router.post("/follow/:id", asyncWrapper(authenticateJWT), followUser);
router.get("/followers/:userId", asyncWrapper(authenticateJWT), getFollowersForUser);
router.delete("/followers/:id", asyncWrapper(authenticateJWT), unfollowUser);

// Rute untuk mendapatkan daftar user yang diikuti (memerlukan otentikasi)
router.get("/following", asyncWrapper(authenticateJWT), getFollowingUsers);

export default router;
