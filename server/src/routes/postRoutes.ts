    import express from 'express';
    import { authenticateJWT } from '../middleware/auth';
    import { asyncWrapper } from '../middleware/asyncWrapper';
    import { createPost, getAllPosts, deletePost, getPostById, getPostsFromFollowing } from '../controllers/postController';
    import { likePost, unlikePost } from '../controllers/likeController';
    import { createComment, deleteComment } from '../controllers/commentController';
    import multer from 'multer';

    const router = express.Router();
    const upload = multer({ dest: 'uploads/' })

    // Post routes
    router.post('/threads', asyncWrapper(authenticateJWT), upload.single('image'), createPost);
    router.get('/threads', getAllPosts);
    router.get('/threads/:postId', getPostById);
    router.delete('/:postId', asyncWrapper(authenticateJWT), deletePost);

    // Like routes
            router.post('/:postId/like', asyncWrapper(authenticateJWT), likePost);
            router.delete('/:postId/unlike', asyncWrapper(authenticateJWT), unlikePost);
    // routes.js (or where you define your routes)
    router.get('/following', asyncWrapper(authenticateJWT), getPostsFromFollowing);


    // Comment routes
    router.post('/:postId/comments', asyncWrapper(authenticateJWT), createComment);
    router.delete('/comments/:commentId', asyncWrapper(authenticateJWT), deleteComment);

    export default router;
