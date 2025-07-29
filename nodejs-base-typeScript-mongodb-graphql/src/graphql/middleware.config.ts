import { TokenType } from '@/enums';
import { verifyToken } from '@/middlewares/verify.token.middleware';
import { authLimiter } from '@/middlewares/rate.limiting.middleware';
import { loginSchema, createUserSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, userList } from '@/joi-schema';

const getQuery = () => {
    const userQuery = {
        users: { auth: verifyToken(), validate: userList }
    }

    return { ...userQuery };
}

const getMutations = () => {
    const userMutation = {
        createUser: { validate: createUserSchema },
        updateProfile: { auth: verifyToken(), validate: updateProfileSchema },
        loginUser: { validate: loginSchema },
        logOut: { auth: verifyToken() },
    }

    const authMutation = {
        refreshToken: { auth: verifyToken(TokenType.REFRESH), limiting: authLimiter },
        forgotPassword: { validate: forgotPasswordSchema },
        resetPassword: { auth: verifyToken(TokenType.FORGOTPASSWORD), validate: resetPasswordSchema }
    }

    return { ...userMutation, ...authMutation };
}

export const middlewareConfig = {
    Query: getQuery(),
    Mutation: getMutations()
};
