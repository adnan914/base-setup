import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateCreateUserSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        phone: Joi.number().optional()
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    } else {
        next();
    }
};

const validateLoginSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    } else {
        next();
    }
};

export {
    validateCreateUserSchema,
    validateLoginSchema,
};
