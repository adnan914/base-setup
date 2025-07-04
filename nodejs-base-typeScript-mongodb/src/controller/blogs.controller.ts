import { Request, Response } from 'express';
import BlogModel from '../models/blogs.model';
import { ResMessageUtil } from '../utils';

class BlogController {
    // Create a new user
    public async createBlog(req: Request, res: Response): Promise<void> {
        try {
            const blogDetails = await BlogModel.create(req.body);
            if (req.file) {
                req.body.blog_image_url = req.file.filename;
            }
            res.status(201).json({ success: true, message: ResMessageUtil.BLOG_CREATE, data: blogDetails });
        } catch (error: any) {
            res.status(500).json({ success: false, message: ResMessageUtil.SERVER_ERROR, error: error.message });
        }
    }

}

export default new BlogController();