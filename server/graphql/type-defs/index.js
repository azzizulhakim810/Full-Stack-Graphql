const { gql } = require("apollo-server");

//  Enum Definitions
module.exports = gql`
  enum Nationality {
    CANADA
    BRAZIL
    INDIA
    GERMANY
    CHILE
    BANGLADESH
  }

  # Input Types
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

  # Type Definitions
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

  type Message {
    id: ID!
    title: String!
    content: String!
  }

  # Result Types
  type UserSuccessfullResult {
    users: [User!]!
  }

  type UserErrorResult {
    message: String!
  }

  union UserResult = UserSuccessfullResult | UserErrorResult

  # Query Definitions
  type Query {
    users(offset: Int, limit: Int): UserResult
    user(id: ID!): User!
    userByName(name: String!): User!
    messages: [Message!]!
    customers: [Customer!]
    customer(email: String!): Customer!
  }

  # Mutation Definitions
  type Mutation {
    createUser(input: CreateUserInput!): User!
    createMessage(messageInput: MessageInput): Message!
    updateUsername(input: UpdateUsernameInput!): User!
    deleteUser(id: ID!): String!

    registerCustomer(registerInput: RegisterInput): Customer!
    loginCustomer(loginInput: LoginInput): Customer!
  }

  # Subscription Definitions
  type Subscription {
    messageCreated: Message!
  }
`;
