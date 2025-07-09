import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import { middlewareConfig } from './middleware.config';
import { generateMiddlewares } from '../utils/generate.middlewares.utils';
import resolvers from './resolvers';
import typeDefs from './typedefs';

const { rateLimiting, authVerify, joiValidate } = generateMiddlewares(middlewareConfig);

const schema = makeExecutableSchema({
    typeDefs: [typeDefs],
    resolvers: [resolvers],
});

export const schemaWithMiddleware = applyMiddleware(
    schema,
    rateLimiting,
    authVerify,
    joiValidate,
);
