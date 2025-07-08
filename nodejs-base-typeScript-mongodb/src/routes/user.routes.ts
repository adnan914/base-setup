import express, { Router } from 'express';
import { verifyToken } from '../middleware/verify.token.middleware';
import { authLimiter } from "../middleware/rate.limiting.middleware";
import { uploadImage } from "../middleware/upload.middleware";
import { validateSchema } from "../middleware/validate.joi.middleware";
import { createUserSchema, loginSchema, updateProfileSchema } from '../joi-schema/user.schema';
import { JoiValidateType } from '../enums';
import userController from '../controller/user.controller';

const routes: Router = express.Router();

routes.post('/registration', authLimiter, validateSchema(createUserSchema, JoiValidateType.BODY), userController.createUser);
routes.post('/login', authLimiter, validateSchema(loginSchema, JoiValidateType.BODY), userController.loginUser);
routes.put('/updateProfile/:id', verifyToken, uploadImage.single('image'), validateSchema(updateProfileSchema, JoiValidateType.BODY), userController.updateProfile);
routes.get('/userList', verifyToken, userController.userList);

export default routes;
