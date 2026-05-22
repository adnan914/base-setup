import { mergeTypeDefs } from "@graphql-tools/merge";
import { commonTypeDefs } from "./common.typeDefs";
import { userTypeDefs } from "./user.typeDefs";
import { authTypeDefs } from "./auth.typeDefs";

const typeDefs = mergeTypeDefs([
    commonTypeDefs,
    userTypeDefs,
    authTypeDefs
]);

export default typeDefs;