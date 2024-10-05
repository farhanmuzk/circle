import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Buat pengguna
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      username: 'user1',
      fullName: 'User One',
      password: 'password123',
      name: 'user1',
      bio: 'Bio of User 1',
      avatar: 'https://example.com/avatar1.png',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      username: 'user2',
      fullName: 'User Two',
      password: 'password123',
      name: 'user2',
      bio: 'Bio of User 2',
      avatar: 'https://example.com/avatar2.png',
    },
  });

  // Buat post untuk user1 dan user2
  const post1 = await prisma.post.create({
    data: {
      text: 'This is a post by user1.',
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      text: 'This is a post by user2.',
      authorId: user2.id,
    },
  });

  // Buat relasi follow
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  // Buat like
  await prisma.like.create({
    data: {
      userId: user1.id,
      postId: post2.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  // Buat comment
  await prisma.comment.create({
    data: {
      text: 'Nice post, user2!',
      userId: user1.id,
      postId: post2.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Thanks, user1!',
      userId: user2.id,
      postId: post1.id,
    },
  });

  console.log('Seeding done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
