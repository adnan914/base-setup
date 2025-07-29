import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '@/models/users.model';
import TokenModel from '@/models/token.model';
import { TokenType } from '@/enums';
import { StringValue } from 'ms';
import { MessageUtil, CommonUtils, NodemailerUtils, StatusUtil, AppError } from '../utils';
import { AuthenticatedRequest, ForgotPassInput, ResetInput, UserDocument } from '../types';

class AuthController {

    public async refreshToken(req: Request, res: Response): Promise<void> {

        const { _id, email } = (req as AuthenticatedRequest).user;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        const accessToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION as StringValue });
        const refreshToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue });

        await TokenModel.deleteMany({ userId: _id });
        await TokenModel.insertMany([
            { userId: _id, token: accessToken, type: TokenType.ACCESS },
            { userId: _id, token: refreshToken, type: TokenType.REFRESH }
        ]);

        res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
            .status(StatusUtil.OK).json({ success: true, message: MessageUtil.TOKEN_GENERATED, data: { accessToken, refreshToken } });

    }


    public async forgotPassword({ body }: { body: ForgotPassInput }, res: Response): Promise<void> {

        const { email } = body;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        const { _id } = user;
        const token = CommonUtils.generateToken({ _id, email, tokenType: TokenType.FORGOTPASSWORD }, process.env.JWT_FORGOT_PASSWORD_SECRET as string, { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION as StringValue });
        await TokenModel.create({ userId: _id, token: token, type: TokenType.FORGOTPASSWORD });

        const resetLink = `${process.env.RESET_URL}${token}`;

        await NodemailerUtils.sendResetEmail(email, resetLink);
        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.REST_LINK_MAIL_SENT });

    }

    public async resetPassword(req: Request, res: Response): Promise<void> {

        const { _id, email } = (req as AuthenticatedRequest).user;
        const { newPassword } = req.body as ResetInput;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();
        await TokenModel.deleteMany({ userId: _id, type: TokenType.FORGOTPASSWORD });
        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.PASS_RESET_SUCC });

    }
}

export default new AuthController();