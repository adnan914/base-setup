import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel, { User } from '../models/users.model';
import TokenModel from '../models/token.model';
import { TokenType } from '../enums';
import { ResMessageUtil, CommonUtils, NodemailerUtils } from '../utils';

class AuthController {

    public async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const storedToken = await TokenModel.findOne({ token: req.body.token });
            if (!storedToken || storedToken.used) {
                res.status(403).json({ status: false, message: ResMessageUtil.INVALID_TOKEN_OR_USED });
                return;
            }

            const user: User | null = await UserModel.findOne({ email: req.userData?.email });
            if (!user) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_TOKEN });
                return;
            }
            const { _id, username, email, phone } = user.toJSON();

            const accessToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = CommonUtils.generateToken({ _id, username, email, phone }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

            storedToken.used = true;
            await storedToken.save();
            await TokenModel.create({ userId: _id, token: refreshToken, type: TokenType.REFRESH });

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

            const storedToken = await TokenModel.findOne({ token: req.body.token });
            if (!storedToken || storedToken.used) {
                res.status(403).json({ status: false, message: ResMessageUtil.INVALID_TOKEN_OR_USED });
                return;
            }

            const user: User | null = await UserModel.findOne({ _id: req.userData?._id });

            if (!user) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_TOKEN });
                return;
            }

            await TokenModel.deleteMany({ userId: req.userData?._id, type: TokenType.REFRESH });

            res
                .clearCookie('accessToken')
                .clearCookie('refreshToken')
                .json({ success: true, message: 'Logged out' });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.SOMETHING_WENT_WRONG, error: error.message });
        }
    }


    public async forgotPassword(req: Request, res: Response): Promise<void> {
        try {

            const user = await UserModel.findOne({ email: req.body.email });

            if (!user) {
                res.status(404).json({ status: false, message: ResMessageUtil.INVALID_MAIL });
                return;
            }

            const { _id, email } = user.toJSON();
            const token = CommonUtils.generateToken({ _id, email }, process.env.JWT_FORGOT_PASSOWRD_SECRET as string, { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION });
            await TokenModel.create({ userId: _id, token: token, type: TokenType.FORGOTPASSWORD });

            const resetLink = `${process.env.RESET_URL}${token}`; // test

            await NodemailerUtils.sendResetEmail(email, resetLink);
            res.json({ success: true, message: ResMessageUtil.REST_LINK_MAIL_SENT });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.SOMETHING_WENT_WRONG, error: error.message });
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {

            const { token, newPassword } = req.body;
            const storedToken = await TokenModel.findOne({ token });
            if (!storedToken || storedToken.used) {
                res.status(403).json({ status: false, message: ResMessageUtil.INVALID_TOKEN_OR_USED });
                return;
            }

            const user: User | null = await UserModel.findOne({ email: req.userData?.email });
            if (!user) {
                res.status(401).json({ success: false, message: ResMessageUtil.INVALID_TOKEN });
                return;
            }
            user.password = await bcryptjs.hash(newPassword, 10);
            user.save();
            await TokenModel.deleteMany({ userId: req.userData?._id, type: TokenType.FORGOTPASSWORD });
            res.json({ success: true, message: ResMessageUtil.PASS_RESET_SUCC });


        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, message: ResMessageUtil.SOMETHING_WENT_WRONG, error: error.message });
        }
    }
}

export default new AuthController();