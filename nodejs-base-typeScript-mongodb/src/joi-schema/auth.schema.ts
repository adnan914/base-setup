import Joi from 'joi';
import { CreateUserInput, ForgotPassInput, LoginInput, ResetInput } from '@/types';

export const createUserSchema: Joi.ObjectSchema<CreateUserInput> = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const loginSchema: Joi.ObjectSchema<LoginInput> = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});


export const forgotPasswordSchema: Joi.ObjectSchema<ForgotPassInput> = Joi.object({
    email: Joi.string().email().required(),
});

export const verifyResetTokenSchema: Joi.ObjectSchema<ResetInput> = Joi.object({
    token: Joi.string().required()
});

export const resetPasswordSchema: Joi.ObjectSchema<ResetInput> = Joi.object({
    id: Joi.string().required(),
    newPassword: Joi.string().required()
});