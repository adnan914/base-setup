import express, { Router } from 'express';
import authController from '../controller/auth.controller';
import { verifyToken } from '../middleware/verify.token.middleware';

import {
    validateCreateUserSchema,
    validateLoginSchema,
    validateForgotPasswordSchema,
    validateResetPasswordSchema
} from '../validations/user.validations';

import { authLimiter, } from "../middleware/rate.limiting.middleware";

const routes: Router = express.Router();

routes.post('/registration', authLimiter, validateCreateUserSchema, authController.createUser);
routes.post('/login', authLimiter, validateLoginSchema, authController.loginUser);
routes.post('/refreshToken', authLimiter, verifyToken, authController.refreshToken);
routes.post('/logout', verifyToken, authController.logout);
routes.post('/forgotPassword', authLimiter, validateForgotPasswordSchema, authController.forgotPassword);
routes.post('/resetPassword', authLimiter, validateResetPasswordSchema, verifyToken, authController.resetPassword);

export default routes;
