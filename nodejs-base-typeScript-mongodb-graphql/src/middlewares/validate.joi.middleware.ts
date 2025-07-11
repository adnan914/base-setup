import Joi from 'joi';
import { MessageUtil } from '../utils';
import { GraphQLError } from 'graphql';

export const validateSchema = (schema: Joi.Schema) => {
    return async (resolve: any, root: any, args: any, context: any, info: any): Promise<any> => {
        const { error } = schema.validate(args.input);
        if (error) {
            throw new GraphQLError(error.message, {
                extensions: { code: MessageUtil.BAD_USER_INPUT, field: error.details }
            });
        }
        return await resolve(root, args, context, info);
    }
};
