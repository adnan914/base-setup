import bcryptjs from 'bcryptjs';
import UserModel from '../models/users.model';
import TokenModel from '../models/token.model';
import { TokenType } from '../enums';
import { MessageUtil, CommonUtils } from '../utils';
import { Response, CreateUserInput, UserDocument, UpdateUserInput, LoginInput, GraphQLContext, UserListInput } from '../types';
import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';

class UserController {
    // Create a new user
    public async createUser(_ctx: GraphQLContext, input: CreateUserInput): Promise<Response<UserDocument>> {

        const { email, password } = input;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (user) throw new GraphQLError(MessageUtil.EMAIL_EXIST);

        input.password = await bcryptjs.hash(password, 10);

        const data: UserDocument = await UserModel.create(input);

        return { success: true, message: MessageUtil.USER_CREATE, data };
    }

    // Update user profile
    public async updateProfile(ctx: GraphQLContext, input: UpdateUserInput): Promise<Response<UserDocument>> {
        const { _id } = ctx.user;

        // if (req.file) req.body.profileImg = req.file.filename;
        const data: UserDocument | null = await UserModel.findOneAndUpdate({ _id }, { $set: input }, { new: true });
        if (!data) throw new GraphQLError(MessageUtil.USER_NOT_FOUND);
        return { success: true, message: MessageUtil.PROFILE_UPDATE_SUCC, data };

    }

    // User login
    public async loginUser(ctx: GraphQLContext, input: LoginInput): Promise<Response<UserDocument>> {

        const { email: inputemail, password: inputPassword } = input;

        const user: UserDocument | null = await UserModel.findOne({ email: inputemail }).select('+password');
        if (!user) throw new GraphQLError(MessageUtil.INVALID_CRED);

        const { _id, password, email } = user;

        const isPasswordMatch = await bcryptjs.compare(inputPassword, password as string);
        if (!isPasswordMatch) throw new GraphQLError(MessageUtil.INVALID_CRED);

        // Generate JWT token and refresh token
        const accessToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

        await TokenModel.deleteMany({ userId: _id });
        await TokenModel.insertMany([
            { userId: _id, token: accessToken, type: TokenType.ACCESS },
            { userId: _id, token: refreshToken, type: TokenType.REFRESH }
        ]);

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        
        ctx.res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })

        
        return { success: true, message: MessageUtil.LOGIN, data: user };
    };

    public async logOut(ctx: GraphQLContext): Promise<Response<void>> {

        const { _id } = ctx.user;
        const user = await UserModel.findOne({ _id });
        if (!user) throw new GraphQLError(MessageUtil.INVALID_TOKEN_OR_USED);

        await TokenModel.deleteMany({ userId: _id });

        ctx.res.clearCookie('accessToken');
        ctx.res.clearCookie('refreshToken');

        return { success: true, message: MessageUtil.LOG_OUT };

    }

    public async userList(_ctx: GraphQLContext, input: UserListInput): Promise<Response<UserDocument[]>> {

        const { limit = 10, lastSeenId } = input;
        if (limit === 0) throw new GraphQLError(MessageUtil.LIMIT_ZERO);
        const matchStage = lastSeenId
            ? { _id: { $gt: new mongoose.Types.ObjectId(lastSeenId) } }
            : {};

        const pipeline: mongoose.PipelineStage[] = [
            {
                $facet: {
                    data: [
                        { $match: matchStage },
                        { $sort: { _id: 1 } },
                        { $limit: limit + 1 }, // +1 to check hasNextPage
                    ],
                    totalCount: [
                        // No match => counts all documents
                        { $count: 'count' },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$totalCount',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const result = await UserModel.aggregate<{
            data: UserDocument[];
            totalCount?: { count: number };
        }>(pipeline);

        const data = result[0]?.data || [];
        const totalCount = result[0]?.totalCount?.count || 0;

        const hasNextPage = data.length > limit;
        const paginatedUsers = hasNextPage ? data.slice(0, -1) : data;
        const newLastSeenId = paginatedUsers[paginatedUsers.length - 1]?._id;
        return { success: true, message: MessageUtil.DATA_FOUND, totalCount, lastSeenId: newLastSeenId, data: paginatedUsers };
    }

}

export default new UserController();