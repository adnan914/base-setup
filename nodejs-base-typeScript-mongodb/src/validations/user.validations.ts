import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateUserSchema = (isUpdate = false) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        let obj = {
            username: isUpdate ? Joi.string() : Joi.string().required(),
            phone: Joi.number().optional()
        }
        if (!isUpdate) {
            Object.assign(obj, {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            })
        }
        const schema = Joi.object(obj);

        const { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message, details: error.details });
        } else {
            next();
        }
    };
};
const validateCreateUserSchema = validateUserSchema(false); // required fields
const validateUpdateUserSchema = validateUserSchema(true);  // optional fields

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
    validateCreateUserSchema,
    validateUpdateUserSchema,
    validateLoginSchema,
    validateForgotPasswordSchema,
    validateResetPasswordSchema
};
