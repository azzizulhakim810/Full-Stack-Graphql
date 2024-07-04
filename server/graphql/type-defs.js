const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    username: String!
    age: Int!
    nationality: Nationality!
  }

  type Query {
    users: UserResult
    user(id: ID!): User!
    userByName(name: String!): User!
    messages: [Message!]!
    message(ID: ID!): Message
  }

  input CreateUserInput {
    name: String!
    username: String!
    age: Int!
    nationality: Nationality = BRAZIL
  }

  input UpdateUsernameInput {
    id: ID!
    newUsername: String!
  }

  input MessageInput {
    title: String!
    content: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # type UserWithToken {
  #  _id: String
  #   email: String
  #   fname: String
  #   lname: String
  #   following: [String]
  #  createdAt: DateTime
  #  updatedAt: DateTime
  #  userJwtToken: JwtToken
  # }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createMessage(messageInput: MessageInput): Message!
    updateUsername(input: UpdateUsernameInput!): User
    deleteUser(id: ID!): String!
    # login(input: LoginInput): UserWithToken
  }

  type Subscription {
    messageCreated: Message!
  }

  enum Nationality {
    CANADA
    BRAZIL
    INDIA
    GERMANY
    CHILE
    BANGLADESH
  }

  type Message {
    id: ID!
    title: String!
    content: String!
  }

  type UserSuccessfullResult {
    users: [User!]!
  }

  type UserErrorResult {
    message: String!
  }

  union UserResult = UserSuccessfullResult | UserErrorResult
`;

module.exports = { typeDefs };
