import Joi from 'joi';
import { ForgotPassInput, ResetInput } from '@/types';

export const forgotPasswordSchema: Joi.ObjectSchema<ForgotPassInput> = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema: Joi.ObjectSchema<ResetInput> = Joi.object({
    tokenType: Joi.string().required(),
    newPassword: Joi.string().required()
});