import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '../models/users.model';
import RefreshTokenModel from '../models/refresh.token.model';
import { ResMessageUtil, CommonUtils } from '../utils';

class AuthController {
    // Create a new user
    public async createUser(req: Request, res: Response): Promise<void> {
        try {
            const isEmailExist = await UserModel.findOne({ email: req.body.email });
            if (isEmailExist) {
                res.status(409).json({ success: false, message: ResMessageUtil.EMAIL_EXIST });
                return;
            }
            req.body.password = await bcryptjs.hash(req.body.password, 10);

            const userDetails = await UserModel.create(req.body);
            res.status(201).json({ success: true, message: ResMessageUtil.USER_CREATE, data: userDetails });
        } catch (error: any) {
            res.status(500).json({ success: false, message: ResMessageUtil.SERVER_ERROR, error: error.message });
        }
    }

    // User login
    public async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const isEmailExist = await UserModel.findOne({ email: req.body.email }).select('+password');

            if (!isEmailExist) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_CRED });
                return;
            }
            const { password } = isEmailExist;

            const isPasswordMatch = await bcryptjs.compare(req.body.password, password);

            if (!isPasswordMatch) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_CRED });
                return;
            }
            const { _id, username, email, phone } = isEmailExist.toJSON();

            // Generate JWT token and refresh token
            const accessToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

            await RefreshTokenModel.create({ userId: _id, token: refreshToken });

            res
                .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
                .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
                .status(200).json({ success: true, message: ResMessageUtil.LOGIN, data: { _id, username, email, phone, accessToken, refreshToken } });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.LOGIN_FAILED, error: error.message });
        }
    }

    public async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const storedToken = await RefreshTokenModel.findOne({ token: req.body.token });
            if (!storedToken || storedToken.used) {
                res.status(403).json({ status: false, message: ResMessageUtil.INVALID_TOKEN_OR_USED });
                return;
            }

            const isExist = await UserModel.findOne({ email: req.userData?.email });
            if (!isExist) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_TOKEN });
                return;
            }
            const { _id, username, email, phone } = isExist.toJSON();

            const accessToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

            storedToken.used = true;
            await storedToken.save();
            await RefreshTokenModel.create({ userId: _id, token: refreshToken });

            res
                .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
                .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
                .status(200).json({ success: true, message: ResMessageUtil.TOKEN_GENERATED, data: { accessToken, refreshToken } });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.SOMETHING_WENT_WRONG, error: error.message });
        }

    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {

            const storedToken = await RefreshTokenModel.findOne({ token: req.body.token });
            if (!storedToken || storedToken.used) {
                res.status(403).json({ status: false, message: ResMessageUtil.INVALID_TOKEN_OR_USED });
                return;
            }

            const isExist = await UserModel.findOne({ _id: req.userData?._id });

            if (!isExist) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_TOKEN });
                return;
            }

            await RefreshTokenModel.deleteMany({ userId: req.userData?._id });

            res
                .clearCookie('accessToken')
                .clearCookie('refreshToken')
                .json({ success: true, message: 'Logged out' });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.SOMETHING_WENT_WRONG, error: error.message });
        }
    }
}

export default new AuthController();