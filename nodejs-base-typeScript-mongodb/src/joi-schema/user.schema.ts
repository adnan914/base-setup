import { Role } from '@/enums';
import { CreateUserInput, LoginInput, UpdateUserInput, UserListInput } from '@/types';
import Joi from 'joi';

export const createUserSchema: Joi.ObjectSchema<CreateUserInput> = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid(...Object.values(Role)).required()
});

export const updateProfileSchema: Joi.ObjectSchema<UpdateUserInput> = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string().valid(...Object.values(Role))
});

export const loginSchema: Joi.ObjectSchema<LoginInput> = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const userListSchema: Joi.ObjectSchema<UserListInput> = Joi.object({
    limit: Joi.number(),
    lastSeenId: Joi.string()
});