import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const likePost = async (req: Request, res: Response) => {
    const postId = parseInt(req.params.postId);
    const userId = (req as any).user.id; // Ensure req.user.id is populated

    // Validate postId and userId
    if (!postId || isNaN(postId) || !userId) {
        return res.status(400).json({ error: "Invalid postId or userId" });
    }

    try {
        // Check if the like already exists using the correct unique input
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { // Use userId_postId for the composite key
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            return res.status(400).json({ error: "Post already liked by this user" });
        }

        const newLike = await prisma.like.create({
            data: {
                postId,
                userId,
            },
        });
        res.status(201).json(newLike);
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Error liking post", details: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};



export const unlikePost = async (req: Request, res: Response) => {
    const postId = parseInt(req.params.postId);
    const userId = (req as any).user.id;

    if (!postId || isNaN(postId) || !userId) {
        return res.status(400).json({ error: "Invalid postId or userId" });
    }

    try {
        const deletedLike = await prisma.like.deleteMany({
            where: {
                postId,
                userId,
            },
        });

        // Check if any like was deleted
        if (deletedLike.count === 0) {
            return res.status(404).json({ error: "No like found for this post by this user" });
        }

        res.status(200).json({ message: "Post unliked" });
    } catch (error) {
        console.error("Error unliking post:", error);
        res.status(500).json({ error: "Error unliking post", details: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};
