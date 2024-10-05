import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../utils/jwtUtils";

const prisma = new PrismaClient();

// Mendapatkan semua pengguna
export const getAllUsersService = async () => {
  return await prisma.user.findMany({
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
};

// Mendapatkan pengguna berdasarkan username
export const getUserByUsernameService = async (username: string) => {
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
    throw new Error("User not found");
  }

  return user;
};

// Mendapatkan informasi pengguna saat ini
export const getCurrentUserService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      bio: true,
      avatar: true,
      createdAt: true,
      followingUsers: { select: { followingId: true } },
      followersUsers: { select: { followerId: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const followingCount = user.followingUsers.length;
  const followerCount = user.followersUsers.length;

  return {
    ...user,
    followingCount,
    followerCount,
  };
};

// Mengikuti atau berhenti mengikuti pengguna lain
export const followUserService = async (followerId: number, followingId: number) => {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return "Unfollowed successfully";
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
    return "Followed successfully";
  }
};

// Mendapatkan daftar pengguna yang diikuti oleh pengguna saat ini
export const getFollowingUsersService = async (userId: number) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
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

  return following.map((f) => f.following);
};
