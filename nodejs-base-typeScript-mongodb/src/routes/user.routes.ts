import express, { Router } from 'express';
import { verifyToken } from '../middleware/verify.token.middleware';
import { authLimiter } from "../middleware/rate.limiting.middleware";
import { uploadImage } from "../middleware/upload.middleware";
import { validateCreateUserSchema, validateUpdateUserSchema, validateLoginSchema } from '../validations/user.validations';
import userController from '../controller/user.controller';

const routes: Router = express.Router();

routes.post('/registration', authLimiter, validateCreateUserSchema, userController.createUser);
routes.post('/login', authLimiter, validateLoginSchema, userController.loginUser);
routes.put('/updateProfile/:id', verifyToken, uploadImage.single('image'), validateUpdateUserSchema, userController.updateProfile);
routes.get('/userList', verifyToken, userController.userList);

export default routes;
