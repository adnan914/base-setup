import jwt from 'jsonwebtoken';
import { MessageUtil } from '../utils';
import { TokenType } from '../enums';
import { GraphQLError } from 'graphql';
import TokenModel from '../models/token.model';
import { GraphQLContext, TokenDocument, UserDecoded } from '../types';

const tokenExist = async (token: string) => {
    if (!token) throw new GraphQLError(MessageUtil.NOT_PROVIDED_TOKEN);
    const storedToken: TokenDocument | null = await TokenModel.findOne({ token });
    if (!storedToken) throw new GraphQLError(MessageUtil.INVALID_TOKEN_OR_USED);
};

const getSecretByTokenType = (tokenType: TokenType): string => {
    switch (tokenType) {
        case TokenType.ACCESS:
            return process.env.JWT_SECRET!;
        case TokenType.REFRESH:
            return process.env.JWT_REFRESH_SECRET!;
        case TokenType.FORGOTPASSWORD:
            return process.env.JWT_FORGOT_PASSWORD_SECRET!;
        default:
            throw new GraphQLError(MessageUtil.INVALID_TOKEN);
    }
};

const checkAuthorization = async (context: any) => {
    const authHeader = context.req.get('Authorization');
    if (!authHeader) throw new GraphQLError(MessageUtil.AUTHORIZATION_MISSING);

    const token: string = authHeader.split(' ')[1];
    await tokenExist(token);
    return token;
}

export const verifyToken = (expectedType = TokenType.ACCESS) => {
    return async (resolve: any, root: any, args: any, context: GraphQLContext, info: any) => {

        const token = await checkAuthorization(context);
        const secret = getSecretByTokenType(expectedType);

        const decoded = jwt.verify(token, secret) as UserDecoded;

        if (!decoded) throw new GraphQLError(MessageUtil.INVALID_TOKEN);
        context.user = decoded;
        return await resolve(root, args, context, info);


    }
};
