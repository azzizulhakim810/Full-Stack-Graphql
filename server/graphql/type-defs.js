const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    username: String!
    age: Int!
    nationality: Nationality!
  }

  type Customer {
    id: ID!
    username: String!
    email: String!
    password: String!
    token: String!
  }

  type Query {
    users(offset: Int, limit: Int): UserResult
    user(id: ID!): User!
    userByName(name: String!): User!
    messages: [Message!]!
    message(id: ID!): Message!
    customers: [Customer!]
    customer(email: String!): Customer!
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

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createMessage(messageInput: MessageInput): Message!
    updateUsername(input: UpdateUsernameInput!): User!
    deleteUser(id: ID!): String!

    registerCustomer(registerInput: RegisterInput): Customer!
    loginCustomer(loginInput: LoginInput): Customer!
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
