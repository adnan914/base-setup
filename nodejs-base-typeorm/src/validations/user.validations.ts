import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateCreateUserSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        dob: Joi.string().optional()
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    }
    next();
};

const validateLoginSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    }
    next();
};

const validateUserIdSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        id: Joi.number().required()
    }).validate(req.params);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    }
    next();
};

const validateUpdateUserSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        username: Joi.string().optional(),
        dob: Joi.string().optional()
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    }
    next();
};

export {
    validateCreateUserSchema,
    validateLoginSchema,
    validateUserIdSchema,
    validateUpdateUserSchema
};
