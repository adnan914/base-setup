import Joi from 'joi';

export const createUserSchema = Joi.object({
    username: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    username: Joi.string(),
    phone: Joi.string().pattern(/^[0-9]{10}$/)
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const userList = Joi.object({
    limit: Joi.number(),
    lastSeenId: Joi.string()
});
