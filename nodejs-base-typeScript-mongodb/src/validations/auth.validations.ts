import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateForgotPasswordSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        email: Joi.string().email().required(),
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    } else {
        next();
    }
};

const validateResetPasswordSchema = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = Joi.object({
        tokenType: Joi.string().required(),
        newPassword: Joi.string().required(),
    }).validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message, details: error.details });
    } else {
        next();
    }
};

export {
    validateForgotPasswordSchema,
    validateResetPasswordSchema
};
