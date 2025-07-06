import express, { Router } from 'express';
import authController from '../controller/auth.controller';
import { verifyToken } from '../middleware/verify.token.middleware';
import { authLimiter, } from "../middleware/rate.limiting.middleware";
import { validateForgotPasswordSchema, validateResetPasswordSchema } from '../validations/auth.validations';

const routes: Router = express.Router();

routes.post('/refreshToken', authLimiter, verifyToken, authController.refreshToken);
routes.post('/logout', verifyToken, authController.logout);
routes.post('/forgotPassword', authLimiter, validateForgotPasswordSchema, authController.forgotPassword);
routes.post('/resetPassword', authLimiter, validateResetPasswordSchema, verifyToken, authController.resetPassword);

export default routes;
