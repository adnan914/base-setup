import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { UserRepository, TokenRepository } from '@/repositories';
import { TokenType } from '@/enums';
import { StringValue } from 'ms';
import { MessageUtil, CommonUtils, NodemailerUtils, StatusUtil, AppError } from '@/utils';
import { AuthenticatedRequest, ForgotPassInput, ResetInput } from '@/types';

class AuthController {

    // Refresh Access & Refresh Tokens
    public async refreshToken(req: Request, res: Response): Promise<void> {
        const { id, email } = (req as AuthenticatedRequest).user;
        const user = await UserRepository.findOneBy({ id });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        const accessToken = CommonUtils.generateToken(
            { id, email, tokenType: TokenType.ACCESS },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRATION as StringValue }
        );

        const refreshToken = CommonUtils.generateToken(
            { id, email, tokenType: TokenType.REFRESH },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue }
        );

        // Delete old tokens and save new tokens
        await TokenRepository.delete({ user: { id } });
        const tokens = [
            TokenRepository.create({ user, token: accessToken, type: TokenType.ACCESS, used: false }),
            TokenRepository.create({ user, token: refreshToken, type: TokenType.REFRESH, used: false })
        ];
        await TokenRepository.save(tokens);

        res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
            .status(StatusUtil.OK)
            .json({ success: true, message: MessageUtil.TOKEN_GENERATED, data: { accessToken, refreshToken } });
    }

    // Forgot Password
    public async forgotPassword(req: Request, res: Response): Promise<void> {
        const { email } = req.body as ForgotPassInput;

        const user = await UserRepository.findOneBy({ email });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        const token = CommonUtils.generateToken(
            { id: user.id, email, tokenType: TokenType.FORGOTPASSWORD },
            process.env.JWT_FORGOT_PASSWORD_SECRET!,
            { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION as StringValue }
        );

        const tokenEntity = TokenRepository.create({
            user,
            token,
            type: TokenType.FORGOTPASSWORD,
            used: false
        });
        await TokenRepository.save(tokenEntity);

        const resetLink = `${process.env.RESET_URL}${token}`;
        await NodemailerUtils.sendResetEmail(email, resetLink);

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.REST_LINK_MAIL_SENT });
    }

    // Reset Password
    public async resetPassword(req: Request, res: Response): Promise<void> {
        const { id, email } = (req as AuthenticatedRequest).user;
        const { newPassword } = req.body as ResetInput;

        const user = await UserRepository.findOneBy({ email });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

        user.password = await bcryptjs.hash(newPassword, 10);
        await UserRepository.save(user);

        // Delete used forgot password tokens
        await TokenRepository.delete({ user: { id }, type: TokenType.FORGOTPASSWORD });

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.PASS_RESET_SUCC });
    }
}

export default new AuthController();
