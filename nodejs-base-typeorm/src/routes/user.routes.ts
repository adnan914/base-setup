import express, { Router } from 'express';
        import userController from '../controller/user.controller';
import { verifyToken } from '../middleware/verify.token.middleware';
import { uploadImage } from '../middleware/upload.middleware';
import {
    validateCreateUserSchema,
    validateUserIdSchema,
    validateLoginSchema,
    validateUpdateUserSchema
} from '../validations/user.validations';

const routes: Router = express.Router();

routes.post('/create', validateCreateUserSchema, userController.createUser);
routes.post('/login', validateLoginSchema, userController.loginUser);
routes.get('/list', verifyToken, userController.listUser);
routes.get('/user/:id', verifyToken, validateUserIdSchema, userController.getUser);
routes.put('/update/:id', verifyToken, validateUpdateUserSchema, uploadImage.single('image'), userController.updateUser);
routes.delete('/delete/:id', verifyToken, validateUserIdSchema, userController.deleteUser);

export default routes;
