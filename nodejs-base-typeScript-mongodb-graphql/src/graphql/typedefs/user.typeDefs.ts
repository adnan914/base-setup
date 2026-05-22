import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  
  scalar Date 
  
  type User {
    _id: String!
    username: String!
    email: String!
    phone: String
    profileImg: String
    createdAt: Date
    updatedAt: Date
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    phone: String
  }

  type CreateUserResponse {
    success: Boolean!
    message: String!
    data: User!
  }

  type LoginUser {
    _id: String!
    username: String!
    email: String!
    phone: String!
    profileImg: String
    accessToken: String
    refreshToken: String
    createdAt: Date
    updatedAt: Date
  }

  input LoginUserInput {
    email: String!
    password: String!
  }
  
  type LoginUserResponse {
    success: Boolean!
    message: String!
    data: LoginUser
  }
  
  input UpdateProfileInput {
    username: String
    phone: String
  }

  type UpdateProfileResponse {
    success: Boolean!
    message: String!
    data: User!
  }

  type LogOutResponse {
    success: Boolean!
    message: String!
  }
  
  input UserListInput{
    limit: Int
    lastSeenId: ID
  }

  type UserListReponse {
    success: Boolean!
    message: String!
    totalCount: Int!
    lastSeenId: ID
    data: [User]!
  }

  type Query {
    users(input: UserListInput): UserListReponse
  }

  type Mutation {
    createUser(input: CreateUserInput!): CreateUserResponse
    updateProfile(input: UpdateProfileInput!): UpdateProfileResponse
    loginUser(input: LoginUserInput!): LoginUserResponse
    logOut: LogOutResponse
  }
`;
