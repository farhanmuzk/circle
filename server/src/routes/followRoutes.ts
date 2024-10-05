// src/routes/followRoutes.ts

import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { followUser, unfollowUser } from '../controllers/followController';

const router = express.Router();

router.post('/follow', asyncWrapper(authenticateJWT), followUser);
router.post('/unfollow', asyncWrapper(authenticateJWT), unfollowUser);

export default router;
