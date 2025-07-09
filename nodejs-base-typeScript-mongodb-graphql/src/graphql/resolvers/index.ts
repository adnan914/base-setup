const { mergeResolvers } = require("@graphql-tools/merge");
import userResolver from "./user.resolver";
import authResolver from "./auth.resolver";

const resolvers = mergeResolvers([
  userResolver,
  authResolver
]);

export default resolvers;
