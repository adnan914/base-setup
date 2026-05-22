import { gql } from 'graphql-tag';

export const authTypeDefs = gql`
  type TokenPair {
    accessToken: String!
    refreshToken: String!
  }

  type RefreshTokenResponse {
    success: Boolean!
    message: String!
    data: TokenPair!
  }

  input ForgotPassInput {
    email: String!
  }

  input ResetPassInput {
    newPassword: String!
  }

  type Mutation {
    refreshToken: RefreshTokenResponse
    forgotPassword(input: ForgotPassInput!): Response
    resetPassword(input: ResetPassInput!): Response
  }
`;
