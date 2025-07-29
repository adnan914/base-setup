import express, { Router } from 'express';
import authController from '@/controller/auth.controller';
import { verifyToken } from '@/middleware/verify.token.middleware';
import { authLimiter, } from "@/middleware/rate.limiting.middleware";
import { validateSchema } from "@/middleware/validate.joi.middleware";
import { JoiValidateType, TokenType } from '@/enums';
import { forgotPasswordSchema, resetPasswordSchema } from '@/joi-schema/auth.schema';
import { catchAsync } from '@/utils/catch.async.utils';

const routes: Router = express.Router();

routes.post('/refreshToken', authLimiter, verifyToken(TokenType.REFRESH), catchAsync(authController.refreshToken));
routes.post('/forgotPassword', authLimiter, validateSchema(forgotPasswordSchema, JoiValidateType.BODY), catchAsync(authController.forgotPassword));
routes.post('/resetPassword', authLimiter, validateSchema(resetPasswordSchema, JoiValidateType.BODY), verifyToken(TokenType.FORGOTPASSWORD), catchAsync(authController.resetPassword));

export default routes;
