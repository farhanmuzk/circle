import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Fungsi untuk mendapatkan semua data user
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk mendapatkan pengguna saat ini
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        followingUsers: {
          select: {
            followingId: true,
          },
        },
        followersUsers: {
          select: {
            followerId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingCount = user.followingUsers.length;
    const followerCount = user.followersUsers.length;

    return res.status(200).json({
      user: {
        ...user,
        followingCount,
        followerCount,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk mendapatkan pengguna berdasarkan username
export const getUserByUsername = async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                bio: true,
                avatar: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// Fungsi untuk follow atau unfollow pengguna
export const followUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    const followerId = decoded.userId;
    const followingId = parseInt(req.params.id);

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      return res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk mendapatkan daftar pengguna yang diikuti
export const getFollowingUsers = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    const following = await prisma.follow.findMany({
      where: { followerId: decoded.userId },
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json(following.map((f) => f.following));
  } catch (error) {
    console.error("Error fetching following users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk mendapatkan daftar followers untuk pengguna tertentu
export const getFollowersForUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(userId) },
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json(followers.map((f) => f.follower));
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk mencari pengguna berdasarkan username
export const searchUsersByUsername = async (req: Request, res: Response) => {
  const { username } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username as string, // Searching for users containing the provided username
          mode: "insensitive", // Case insensitive search
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fungsi untuk memperbarui profil pengguna
export const updateUserProfile = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: number };
        const userId = decoded.userId;

        const { username, fullName, bio } = req.body;
        const avatar = req.file ? req.file.path : undefined; // Gunakan path file yang diupload

        // Siapkan objek untuk data yang akan diperbarui
        const updateData: any = {};
        if (username) updateData.username = username;
        if (fullName) updateData.fullName = fullName;
        if (bio) updateData.bio = bio;
        if (avatar) updateData.avatar = avatar;

        // Gunakan Prisma untuk mengupdate data pengguna
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const unfollowUser = async (req: Request, res: Response) => {
  const followerId = (req as any).user.id;
  const followingId = parseInt(req.params.id);

  console.log("Follower ID:", followerId);
  console.log("Following ID:", followingId);

  try {
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
