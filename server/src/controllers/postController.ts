import { Request, Response } from "express";
import prisma from "../config/prisma";

// Like Post
export const likePost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const userId = (req as any).user.id;

  try {
    const newLike = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    res.status(201).json(newLike);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error liking post",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Unlike Post
export const unlikePost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const userId = (req as any).user.id;

  try {
    await prisma.like.deleteMany({
      where: {
        postId,
        userId,
      },
    });
    res.status(200).json({ message: "Post unliked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error unliking post",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Create Post
export const createPost = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // Safely access user ID
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID is missing." });
  }

  const { text } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Path to the uploaded image

  try {
    const post = await prisma.post.create({
      data: {
        text,
        image: imageUrl,
        authorId: userId,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Get All Posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        likes: true,
        comments: {
          include: { user: { select: { username: true, avatar: true } } },
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching posts",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Get Post By Id
export const getPostById = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId); // Ambil ID dari parameter

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        likes: true,
        comments: {
          include: { user: { select: { username: true, avatar: true } } },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" }); // Jika tidak ditemukan, kembalikan status 404
    }

    res.status(200).json(post); // Kembalikan post jika ditemukan
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching post",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Get Posts From Following
export const getPostsFromFollowing = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const followingIds = await prisma.user
      .findUnique({
        where: { id: userId },
        select: {
          followingUsers: {
            select: {
              followingId: true, // Ambil followingId untuk relasi
            },
          },
        },
      })
      .then((user) => user?.followingUsers.map((f) => f.followingId) || []); // Perbaikan di sini

    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
      },
      include: {
        author: {
          select: {
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        likes: true,
        comments: {
          include: { user: { select: { username: true, avatar: true } } },
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching posts from following users",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Delete Post
export const deletePost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);

  try {
    await prisma.post.delete({
      where: { id: postId },
    });
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error deleting post",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
