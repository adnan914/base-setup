import { gql } from 'graphql-tag';

export const commonTypeDefs = gql`
  type Response {
    success: Boolean!
    message: String!
  }
`;
