import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
    tokenType: Joi.string().required(),
    newPassword: Joi.string().required()
});