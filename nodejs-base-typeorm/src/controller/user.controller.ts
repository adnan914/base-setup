import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { AppDataSource } from '../config/typeorm';
import { User } from '../entities/users/user.model';
import { resMessage } from '../helpers/response.messages.helper';
import { generateToken } from '../helpers/common.functions.helper';

class UserController {
    private user = AppDataSource.getRepository(User);
    // Create a new user
    public async createUser(req: Request, res: Response): Promise<void> {
        try {
            console.log('name', req.body);
            // Check if email already exists
            const isEmailExist = await this.user.findOne({ where: { email: req.body.email } });

            // 409 Conflict
            if (isEmailExist) {
                res.status(409).json({ success: false, message: resMessage.EMAIL_EXIST });
            }

            // Hash password before saving
            req.body.password = await bcryptjs.hash(req.body.password, 10);

            // Create user
            const userDetails = await this.user.create(req.body);
            // delete userDetails.password; // Exclude password from response

            res.status(201).json({ success: true, message: resMessage.USER_CREATE, data: userDetails });
        } catch (error: any) {
            res.status(500).json({ success: false, message: resMessage.SERVER_ERROR, error: error.message });
        }
    }

    // User login
    public async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const isEmailExist: User | null = await this.user.findOne({ where: { email: req.body.email }, select: { password: true } });

            // 401 Unauthorized
            if (!isEmailExist) {
                res.status(401).json({ success: false, message: resMessage.INVALID_CRED });
            }
            const password = isEmailExist?.password ?? '';
            // Compare password
            const isPasswordMatch = await bcryptjs.compare(req.body.password, password);

            // 401 Unauthorized if passwords don't match
            if (!isPasswordMatch) {
                res.status(401).json({ success: false, message: resMessage.INVALID_CRED });
            }

            // Prepare user data
            const userData = { ...isEmailExist };
            delete userData.password;

            // Generate JWT token and refresh token
            const token = generateToken(userData, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = generateToken(userData, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

            res.status(200).json({ success: true, message: resMessage.LOGIN, data: { ...userData, token, refreshToken } });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: resMessage.LOGIN_FAILED, error: error.message });
        }
    }

    // Get list of all users
    public async listUser(req: Request, res: Response): Promise<void> {
        try {
            const userList = await this.user.find()
            res.status(200).json({ success: true, message: resMessage.DATA_FOUND, data: userList });
        } catch (error: any) {
            res.status(500).json({ success: false, message: resMessage.SERVER_ERROR, error: error.message });
        }
    }

    // Get user by ID
    public async getUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.user.findOne({ where: { id: Number(req.params.id) } });

            // 404 Not Found
            if (!user) {
                res.status(404).json({ success: false, message: resMessage.NO_DATA_FOUND });
            }

            res.status(200).json({ success: true, message: resMessage.DATA_FOUND, data: user });
        } catch (error: any) {
            res.status(500).json({ success: false, message: resMessage.SERVER_ERROR, error: error.message });
        }
    }

    // Update user by ID
    public async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.user.findOne({ where: { id: Number(req.params.id) } });

            // 404 Not Found
            if (!user) {
                res.status(404).json({ success: false, message: resMessage.INVALID_ID });
            }

            if (req.file) {
                req.body.profileImg = req.file.filename;
            }

            await this.user.update({ id: Number(req.params.id) }, req.body);
            res.status(200).json({ success: true, message: resMessage.UPDATE_SUCC });
        } catch (error: any) {
            res.status(500).json({ success: false, message: resMessage.UPDATE_FAILED, error: error.message });
        }
    }

    // Delete user by ID
    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.user.findOne({ where: { id: Number(req.params.id) } });

            // 404 Not Found
            if (!user) {
                res.status(404).json({ success: false, message: resMessage.INVALID_ID });
            }

            await this.user.delete({ id: Number(req.params.id) });
            res.status(200).json({ success: true, message: resMessage.DELETE_SUCC });
        } catch (error: any) {
            res.status(500).json({ success: false, message: resMessage.DELETE_FAILED, error: error.message });
        }
    }
}

export default new UserController();