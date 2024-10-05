// Import necessary modules
import { Request, Response } from "express";
import prisma from "../config/prisma";

// Create Comment
export const createComment = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const { text } = req.body;
  const userId = (req as any).user.id; // Get user ID from the authenticated user

  // Validate input
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Comment text is required" });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        postId,
        userId,
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating comment" });
  }
};

// Delete Comment (Optional, if you want to implement this too)
export const deleteComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.commentId);

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error deleting comment" });
  }
};
