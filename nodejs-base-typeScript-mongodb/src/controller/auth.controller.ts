import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '@/models/users.model';
import TokenModel from '@/models/token.model';
import { TokenType } from '@/enums';
import { StringValue } from 'ms';
import { MessageUtil, CommonUtils, NodemailerUtils, StatusUtil, AppError } from '../utils';
import { AuthenticatedRequest, CreateUserInput, ForgotPassInput, LoginInput, ResetInput, TokenDocument, UserDocument } from '../types';

class AuthController {

    public async createUser({ body }: { body: CreateUserInput }, res: Response): Promise<void> {

        let { email, password } = body;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (user) throw new AppError(MessageUtil.EMAIL_EXIST, StatusUtil.CONFLICT);
        const encryptedPassword = await bcryptjs.hash(password, 10);

        const data: UserDocument = await UserModel.create({ ...body, password: encryptedPassword });

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.USER_CREATE, user: data });
    }

    // User login
    public async loginUser({ body }: { body: LoginInput }, res: Response): Promise<void> {
        const { email, password } = body;
        const user: UserDocument | null = await UserModel.findOne({ email }).select('+password');
        if (!user) throw new AppError(MessageUtil.INVALID_CRED, StatusUtil.UNAUTHORIZED);

        const { _id, password: encryptedPass } = user;

        const isPasswordMatch = await bcryptjs.compare(password, encryptedPass as string);

        if (!isPasswordMatch) throw new AppError(MessageUtil.INVALID_CRED, StatusUtil.UNAUTHORIZED);

        // Generate JWT token and refresh token
        const accessToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION as StringValue });
        const refreshToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue });

        await TokenModel.deleteMany({ userId: _id });
        await TokenModel.insertMany([
            { userId: _id, token: accessToken, type: TokenType.ACCESS },
            { userId: _id, token: refreshToken, type: TokenType.REFRESH }
        ]);

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
            .status(StatusUtil.OK).json({ success: true, message: MessageUtil.LOGIN, accessToken, refreshToken, user });
    }

    public async logOut(req: Request, res: Response): Promise<void> {
        const { _id } = (req as AuthenticatedRequest).user;
        const user = await UserModel.findOne({ _id });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);

        await TokenModel.deleteMany({ userId: _id });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.LOG_OUT });

    }

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
        if (!user) throw new AppError(MessageUtil.EMAIL_NOT_FOUND, StatusUtil.NOT_FOUND);

        const { _id } = user;
        const token = CommonUtils.generateToken({ _id, email, tokenType: TokenType.FORGOTPASSWORD }, process.env.JWT_FORGOT_PASSWORD_SECRET as string, { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION as StringValue });
        await TokenModel.create({ userId: _id, token: token, type: TokenType.FORGOTPASSWORD });
        const resetLink = `${process.env.RESET_URL}${token}`;

        await NodemailerUtils.sendResetEmail(email, resetLink);
        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.REST_LINK_MAIL_SENT });

    }

    public async verifyResetToken(req: Request, res: Response): Promise<void> {
        const { token } = req.body;
        if (!token) throw new AppError(MessageUtil.NOT_PROVIDED_TOKEN, StatusUtil.FORBIDDEN);
        const storedToken: TokenDocument | null = await TokenModel.findOne({ token });
        if (!storedToken) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);

        const user: UserDocument | null = await UserModel.findOne({ _id: storedToken.userId });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);
        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.TOKEN_VERIFIED, id: user._id });
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        const { id, newPassword } = req.body as ResetInput;

        const user: UserDocument | null = await UserModel.findOne({ _id: id });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();
        await TokenModel.deleteMany({ userId: id, type: TokenType.FORGOTPASSWORD });
        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.PASS_RESET_SUCC });
    }
}

export default new AuthController();