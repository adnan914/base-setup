import bcryptjs from 'bcryptjs';
import UserModel from '../models/users.model';
import TokenModel from '../models/token.model';
import { TokenType } from '../enums';
import { MessageUtil, CommonUtils, NodemailerUtils } from '../utils';
import { UserDocument, Response, RefreshResponse, ResetInput, ForgotPassInput, GraphQLContext } from '../types';
import { GraphQLError } from 'graphql';

class AuthController {

    public async refreshToken(ctx: GraphQLContext): Promise<Response<RefreshResponse>> {
        const { _id, email } = ctx.user;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        const accessToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

        await TokenModel.deleteMany({ userId: _id });
        await TokenModel.insertMany([
            { userId: _id, token: accessToken, type: TokenType.ACCESS },
            { userId: _id, token: refreshToken, type: TokenType.REFRESH }
        ]);

        ctx.res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })

        return { success: true, message: MessageUtil.TOKEN_GENERATED, data: { accessToken, refreshToken } };

    }

    public async forgotPassword(_ctx: GraphQLContext, input: ForgotPassInput): Promise<Response<void>> {
        const { email } = input;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        const { _id } = user;
        const token = CommonUtils.generateToken({ _id, email, tokenType: TokenType.FORGOTPASSWORD }, process.env.JWT_FORGOT_PASSWORD_SECRET as string, { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION });
        await TokenModel.create({ userId: _id, token: token, type: TokenType.FORGOTPASSWORD });

        const resetLink = `${process.env.RESET_URL}${token}`;

        await NodemailerUtils.sendResetEmail(email, resetLink);
        return { success: true, message: MessageUtil.REST_LINK_MAIL_SENT };

    }

    public async resetPassword(ctx: GraphQLContext, input: ResetInput): Promise<Response<void>> {
        const { _id, email } = ctx.user;
        const { newPassword } = input;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();
        await TokenModel.deleteMany({ userId: _id, type: TokenType.FORGOTPASSWORD });

        return { success: true, message: MessageUtil.PASS_RESET_SUCC };

    }
}

export default new AuthController();