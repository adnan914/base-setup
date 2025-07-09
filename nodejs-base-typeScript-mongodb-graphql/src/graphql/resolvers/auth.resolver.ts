import { ResetInput, ForgotPassInput, Response, RefreshResponse } from '../../types';
import { GraphQLContext } from '../../types';
import authController from '../../controller/auth.controller';

const authResolver = {
  Mutation: {
    refreshToken: (
      _: unknown,
      _arg: unknown,
      ctx: GraphQLContext
    ): Promise<Response<RefreshResponse>> => authController.refreshToken(ctx),

    forgotPassword: (
      _: unknown,
      { input }: { input: ForgotPassInput },
      ctx: GraphQLContext
    ): Promise<Response<void>> => authController.forgotPassword(ctx, input),

    resetPassword: (
      _: unknown,
      { input }: { input: ResetInput },
      ctx: GraphQLContext
    ): Promise<Response<void>> => authController.resetPassword(ctx, input),
  }
};

export default authResolver;