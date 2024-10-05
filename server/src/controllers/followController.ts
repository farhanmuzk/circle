// src/controllers/followController.ts

import { Request, Response } from "express";
import prisma from "../config/prisma";

// Follow a user
export const followUser = async (req: Request, res: Response) => {
  const followerId = (req as any).user.id;
  const { followingId } = req.body;

  if (followerId === followingId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    // Check if the follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: "You are already following this user" });
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    res.status(200).json({ message: "Successfully followed the user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Error following user" });
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response) => {
  const followerId = (req as any).user.id;
  const { followingId } = req.body;

  try {
    // Check if the follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.status(200).json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Error unfollowing user" });
  }
};
