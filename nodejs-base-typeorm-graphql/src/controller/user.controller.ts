import bcryptjs from 'bcryptjs';
import { UserRepository, TokenRepository } from '@/repositories';
import { TokenType } from '@/enums';
import { MessageUtil, CommonUtils } from '@/utils';
import { Response, CreateUserInput, UserDocument, UpdateUserInput, LoginInput, GraphQLContext, UserListInput } from '@/types';
import { GraphQLError } from 'graphql';
import { StringValue } from 'ms';
import { LessThan } from 'typeorm';

class UserController {
    // Create a new user
    public async createUser(_ctx: GraphQLContext, input: CreateUserInput): Promise<Response<UserDocument>> {

        const { email } = input;


        const existingUser = await UserRepository.findOneBy({ email });
        if (existingUser) throw new GraphQLError(MessageUtil.EMAIL_EXIST);

        const password = CommonUtils.generateRandomString(10);
        const encryptedPassword = await bcryptjs.hash(password, 10);
        const user = UserRepository.create({ ...input, password: encryptedPassword });
        await UserRepository.save(user);

        const data: UserDocument = await UserRepository.save(user);

        return { success: true, message: MessageUtil.USER_CREATE, data };
    }

    // Update user profile
    public async updateProfile(ctx: GraphQLContext, input: UpdateUserInput): Promise<Response<UserDocument>> {
        const { id } = ctx.user;

        // if (req.file) req.body.profileImg = req.file.filename;
        const user = await UserRepository.findOneBy({ id });
        if (!user) throw new GraphQLError(MessageUtil.USER_NOT_FOUND);
        Object.assign(user, ctx.user);
        await UserRepository.save(user);
        return { success: true, message: MessageUtil.PROFILE_UPDATE_SUCC, data: user };

    }

    // User login
    public async loginUser(ctx: GraphQLContext, input: LoginInput): Promise<Response<UserDocument>> {

        const { email, password }: LoginInput = input;

        const user = await UserRepository.findOne({
            where: { email },
            select: ["id", "email", "password", "role", "status"]
        });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_CRED);

        const isPasswordMatch = await bcryptjs.compare(password, user.password!);
        if (!isPasswordMatch) throw new GraphQLError(MessageUtil.INVALID_CRED);

        // Generate JWT tokens
        const payload = { id: user.id, email: user.email };
        const accessToken = CommonUtils.generateToken({ ...payload, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION as StringValue });
        const refreshToken = CommonUtils.generateToken({ ...payload, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue });

        const tokens = [
            TokenRepository.create({ user, token: accessToken, type: TokenType.ACCESS, used: false }),
            TokenRepository.create({ user, token: refreshToken, type: TokenType.REFRESH, used: false })
        ];
        await TokenRepository.save(tokens);

        (user as any).accessToken = accessToken;
        (user as any).refreshToken = refreshToken;

        ctx.res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })


        return { success: true, message: MessageUtil.LOGIN, data: user };
    };

    public async logOut(ctx: GraphQLContext): Promise<Response<void>> {

        const { id } = ctx.user;

        const user = await UserRepository.findOneBy({ id });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN_OR_USED);

        await TokenRepository.delete({ user: { id } });

        ctx.res.clearCookie('accessToken');
        ctx.res.clearCookie('refreshToken');

        return { success: true, message: MessageUtil.LOG_OUT };

    }

    public async userList(_ctx: GraphQLContext, input: UserListInput): Promise<Response<UserDocument[]>> {

        const { limit = 10, lastSeenId } = input;
        if (limit === 0) throw new GraphQLError(MessageUtil.LIMIT_ZERO);
        const whereCondition: any = {};
        if (lastSeenId) whereCondition.id = LessThan(lastSeenId);

        const users = await UserRepository.find({
            where: whereCondition,
            order: { id: 'ASC' },
            take: limit + 1
        });

        const hasNextPage = users.length > limit;
        const paginatedUsers = hasNextPage ? users.slice(0, -1) : users;
        const newLastSeenId = paginatedUsers[paginatedUsers.length - 1]?.id;

        const totalCount = await UserRepository.count();

        return { success: true, message: MessageUtil.DATA_FOUND, totalCount, lastSeenId: newLastSeenId, data: paginatedUsers };
    }

}

export default new UserController();