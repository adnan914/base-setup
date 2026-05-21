import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext =
        GqlExecutionContext.create(context).getContext<GraphqlHttpContext>();

      return { req: gqlContext.req, res: gqlContext.res };
    }

    return super.getRequestResponse(context);
  }
}
