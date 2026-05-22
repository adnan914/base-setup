import express, { Router } from 'express';
import { verifyToken } from '@/middleware/verify.token.middleware';
import { authLimiter } from "@/middleware/rate.limiting.middleware";
import { uploadImage } from "@/middleware/upload.middleware";
import { validateSchema } from "@/middleware/validate.joi.middleware";
import { createUserSchema, loginSchema, updateProfileSchema, userListSchema } from '@/joi-schema/user.schema';
import { JoiValidateType } from '@/enums';
import userController from '@/controller/user.controller';
import { catchAsync } from '@/utils/catch.async.utils';

const routes: Router = express.Router();

routes.post('/registration', authLimiter, validateSchema(createUserSchema, JoiValidateType.BODY), catchAsync(userController.createUser));
routes.post('/login', authLimiter, validateSchema(loginSchema, JoiValidateType.BODY), catchAsync(userController.loginUser));
routes.put('/updateProfile/:id', verifyToken(), uploadImage.single('image'), validateSchema(updateProfileSchema, JoiValidateType.BODY), catchAsync(userController.updateProfile));
routes.post('/logout', verifyToken(), userController.logOut);
routes.get('/userList', validateSchema(userListSchema, JoiValidateType.QUERY), verifyToken(), userController.userList);

export default routes;
