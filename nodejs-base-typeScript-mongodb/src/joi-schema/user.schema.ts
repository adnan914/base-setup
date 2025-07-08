import Joi from 'joi';

export const createUserSchema = Joi.object({
    username: Joi.string().required(),
    phone: Joi.number().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    username: Joi.string(),
    phone: Joi.number()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});
