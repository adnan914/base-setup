import express, { Router } from 'express';
import { uploadImage } from '../middleware/upload.middleware';
import { validateCreateBlogSchema } from '../validations/blog.validations';
import blogsController from '../controller/blogs.controller';
import { verifyToken } from '../middleware/verify.token.middleware';

const routes: Router = express.Router();

routes.post('/createBlog', [verifyToken, validateCreateBlogSchema, uploadImage.single('image')], blogsController.createBlog);
export default routes;
