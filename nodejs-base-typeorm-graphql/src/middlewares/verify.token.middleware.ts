import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, MessageUtil, StatusUtil } from '@/utils';
import { TokenType } from '@/enums';
import { AppDataSource } from '@/config/app.data.source';
import { Token } from '@/entities/token.entity';
import { AuthenticatedRequest, UserDecoded } from '@/types';

// Check if token exists in DB
const tokenExist = async (token: string): Promise<Token> => {
    if (!token) throw new AppError(MessageUtil.NOT_PROVIDED_TOKEN, StatusUtil.FORBIDDEN);

    const tokenRepository = AppDataSource.getRepository(Token);
    const storedToken = await tokenRepository.findOne({ where: { token } });

    if (!storedToken) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);
    if (storedToken.used) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);

    return storedToken;
};

// Get JWT secret based on token type
const getSecretByTokenType = (tokenType: TokenType): string => {
    switch (tokenType) {
        case TokenType.ACCESS:
            return process.env.JWT_SECRET!;
        case TokenType.REFRESH:
            return process.env.JWT_REFRESH_SECRET!;
        case TokenType.FORGOTPASSWORD:
            return process.env.JWT_FORGOT_PASSWORD_SECRET!;
        default:
            throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);
    }
};

// Extract and validate token from headers
const checkAuthorization = async (headers: any): Promise<string> => {
    const token = headers['authorization']?.split(' ')[1];
    if (!token) throw new AppError(MessageUtil.AUTHORIZATION_MISSING, StatusUtil.UNAUTHORIZED);

    await tokenExist(token);
    return token;
};

// Middleware to verify JWT token
export const verifyToken = (type: TokenType = TokenType.ACCESS) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = await checkAuthorization(req.headers);
            const secret = getSecretByTokenType(type);

            const decoded = jwt.verify(token, secret) as UserDecoded;

            if (!decoded) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);

            (req as AuthenticatedRequest).user = decoded;

            next();
        } catch (error) {
            res.status(StatusUtil.UNAUTHORIZED).json({ status: false, message: MessageUtil.INVALID_TOKEN });
        }
    };
};
