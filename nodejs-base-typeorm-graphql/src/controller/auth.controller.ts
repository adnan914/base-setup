import bcryptjs from 'bcryptjs';
import { UserRepository, TokenRepository } from '@/repositories';
import { TokenType } from '@/enums';
import { StringValue } from 'ms';
import { MessageUtil, CommonUtils, NodemailerUtils } from '@/utils';
import { Response, RefreshResponse, ResetInput, ForgotPassInput, GraphQLContext } from '@/types';
import { GraphQLError } from 'graphql';

class AuthController {

    public async refreshToken(ctx: GraphQLContext): Promise<Response<RefreshResponse>> {
        const { id, email } = ctx.user;
        const user = await UserRepository.findOneBy({ id });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        const accessToken = CommonUtils.generateToken({ id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION as StringValue });
        const refreshToken = CommonUtils.generateToken({ id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue });


        // Delete old tokens and save new tokens
        await TokenRepository.delete({ user: { id } });
        const tokens = [
            TokenRepository.create({ user, token: accessToken, type: TokenType.ACCESS, used: false }),
            TokenRepository.create({ user, token: refreshToken, type: TokenType.REFRESH, used: false })
        ];
        await TokenRepository.save(tokens);

        ctx.res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 });

        return { success: true, message: MessageUtil.TOKEN_GENERATED, data: { accessToken, refreshToken } };

    }

    public async forgotPassword(_ctx: GraphQLContext, input: ForgotPassInput): Promise<Response<void>> {
        const { email } = input;

        const user = await UserRepository.findOneBy({ email });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        const { id } = user;
        const token = CommonUtils.generateToken({ id, email, tokenType: TokenType.FORGOTPASSWORD }, process.env.JWT_FORGOT_PASSWORD_SECRET as string, { expiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRATION as StringValue });
        await TokenRepository.create({ userId: id, token: token, type: TokenType.FORGOTPASSWORD });

        const resetLink = `${process.env.RESET_URL}${token}`;

        await NodemailerUtils.sendResetEmail(email, resetLink);
        return { success: true, message: MessageUtil.REST_LINK_MAIL_SENT };

    }

    public async resetPassword(ctx: GraphQLContext, input: ResetInput): Promise<Response<void>> {
        const { id, email } = ctx.user;
        const { newPassword } = input;

        const user = await UserRepository.findOneBy({ email });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN);

        user.password = await bcryptjs.hash(newPassword, 10);
        await UserRepository.save(user);
        await TokenRepository.delete({ userId: id, type: TokenType.FORGOTPASSWORD });

        return { success: true, message: MessageUtil.PASS_RESET_SUCC };

    }
}

export default new AuthController();