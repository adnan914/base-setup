export const typeDefs = `
scalar DateTime

type User {
  id: Int!
  user_name: String
  email: String
  role: Role!
  created_at: DateTime
  updated_at: DateTime
  attendance: Attendance
}

type Attendance {
  id: Int!
  userId: Int!
  date: DateTime!
  status: String!
  created_at: DateTime!
  updated_at: DateTime!
  user: User!
}

type UserAuthenticationResponse {
  token: String
  user: User
}
enum Role {
  ADMIN
  USER
  MODERATOR
}

type Query {
  users: [User]
  getAttendances(userId: Int): [Attendance]
  userPagination(skip: Int, take: Int) :[User]
}

type Mutation {
  createUser(username: String, email: String, password: String,role : String): User
  login(email: String, password: String): UserAuthenticationResponse
  createAttendance(userId: Int, date: DateTime, status: String): Attendance
}
`;
  