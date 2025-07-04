import express, { Router } from 'express';
import authController from '../controller/auth.controller';
import { verifyToken } from '../middleware/verify.token.middleware';

import {
    validateCreateUserSchema,
    validateLoginSchema,
} from '../validations/user.validations';

const routes: Router = express.Router();

routes.post('/registration', validateCreateUserSchema, authController.createUser);
routes.post('/login', validateLoginSchema, authController.loginUser);
routes.post('/refreshToken', verifyToken, authController.refreshToken);
routes.post('/logout', verifyToken, authController.logout);
export default routes;
