import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '../models/users.model';
import TokenModel from '../models/token.model';
import { TokenType } from '../enums';
import { ResMessageUtil, CommonUtils } from '../utils';

class UserController {
    // Create a new user
    public async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
            if (user) {
                res.status(409).json({ success: false, message: ResMessageUtil.EMAIL_EXIST });
                return;
            }
            req.body.password = await bcryptjs.hash(req.body.password, 10);

            const data = await UserModel.create(req.body);
            res.status(201).json({ success: true, message: ResMessageUtil.USER_CREATE, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: ResMessageUtil.SERVER_ERROR, error: error.message });
        }
    }

    // Update user profile
    public async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await UserModel.findOne({ _id: id });
            if (!user) {
                res.status(404).json({ success: false, message: ResMessageUtil.USER_NOT_FOUND });
                return;
            }
            if (req.file) req.body.profileImg = req.file.filename;
            const data = await UserModel.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true });

            res.status(201).json({ success: true, message: ResMessageUtil.PROFILE_UPDATE_SUCC, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: ResMessageUtil.SERVER_ERROR, error: error.message });
        }
    }

    // User login
    public async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserModel.findOne({ email: req.body.email }).select('+password');

            if (!user) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_CRED });
                return;
            }

            const { _id, username, password, email, phone } = user;

            const isPasswordMatch = await bcryptjs.compare(req.body.password, password);

            if (!isPasswordMatch) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_CRED });
                return;
            }

            // Generate JWT token and refresh token
            const accessToken = CommonUtils.generateToken({ _id, email }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = CommonUtils.generateToken({ _id, email }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

            await TokenModel.deleteMany({ userId: _id });
            await TokenModel.create({ userId: _id, token: refreshToken, type: TokenType.REFRESH });

            res
                .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
                .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
                .status(200).json({ success: true, message: ResMessageUtil.LOGIN, data: { _id, username, email, phone, accessToken, refreshToken } });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.LOGIN_FAILED, error: error.message });
        }
    }

    public async userList(req: Request, res: Response): Promise<void> {
        try {
            const data = await UserModel.find();
            res.status(201).json({ success: true, message: ResMessageUtil.DATA_FOUND, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: ResMessageUtil.SERVER_ERROR, error: error.message });
        }
    }

}

export default new UserController();