import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { console } from 'inspector';

const validateCreateBlogSchema = (req: Request, res: Response, next: NextFunction): void => {
    console.log("req.body", req.body)
    const { error } = Joi.object({
        title: Joi.string().required(),
        category: Joi.string().required(),
        author: Joi.string().optional()
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    } else {
        next();
    }
};

export {
    validateCreateBlogSchema,
};
