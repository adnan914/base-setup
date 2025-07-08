import express, { Router } from 'express';
import authController from '../controller/auth.controller';
import { verifyToken } from '../middleware/verify.token.middleware';
import { authLimiter, } from "../middleware/rate.limiting.middleware";
import { validateSchema } from "../middleware/validate.joi.middleware";
import { JoiValidateType } from '../enums';
import { forgotPasswordSchema, resetPasswordSchema } from '../joi-schema/auth.schema';

const routes: Router = express.Router();

routes.post('/refreshToken', authLimiter, verifyToken, authController.refreshToken);
routes.post('/logout', verifyToken, authController.logout);
routes.post('/forgotPassword', authLimiter, validateSchema(forgotPasswordSchema, JoiValidateType.BODY), authController.forgotPassword);
routes.post('/resetPassword', authLimiter, validateSchema(resetPasswordSchema, JoiValidateType.BODY), verifyToken, authController.resetPassword);

export default routes;
