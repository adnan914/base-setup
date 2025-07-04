import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './typeDefs';
import  {resolvers} from "./resolvers";
import { applyMiddleware } from "graphql-middleware";
import { shield, rule, and } from "graphql-shield";
import {verifyToken} from '../utils/jwt.utils'


export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefs],
});


const isAuthenticated = async (
  resolve: any,
  root: any,
  args: any,
  context: any,
  info: any
) => {
  try{
  let decoded: any;
  decoded = verifyToken(context.req.get("Authorization"));
if (decoded){
  context.req.user = decoded;
  const user = await resolve(root, args, context, info);
  return user;
}else{
 throw new Error("!Authentication")
}
  }catch(error){
    return error
  }
};
const isAdmin = rule({ cache: 'contextual' })(async (_parent, _args, ctx, _info) => {
  return ctx.req.user.role.includes('ADMIN')
})

const isValid = rule({ cache: "contextual" })(
  async (_parent: any, _args: any, ctx: any, _info: any) => {
    return ctx.req.user !== null;
  }
);

const middlewares = {
  Query: {
    users: isAuthenticated,
    getAttendances: isAuthenticated,
    userPagination: isAuthenticated,

  },
  Mutation: {
    createAttendance: isAuthenticated,
  },
};

const permissions = shield({
  Query: {
    users: and(isValid,isAdmin),
  },
  Mutation: {
    createAttendance : and(isValid,isAdmin)
  }
});

export const schemaWithMiddleware = applyMiddleware(
  schema,
  middlewares,
  permissions
);
