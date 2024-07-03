const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    username: String!
    age: Int!
    nationality: Nationality!
    friends: [User]
    favoriteMovies: [Movie]
  }

  type Movie {
    id: ID!
    name: String!
    yearOfPublication: Int!
    isInTheaters: Boolean!
  }

  type Query {
    users: UserResult
    user(id: ID!): User!
    movies: [Movie!]!
    movie(name: String!): Movie!
    message(id: ID!): Message
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

  input CreateMessageInput {
    title: String
    content: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    createMessage(messageInput: CreateMessageInput!): Message!
    updateUsername(input: UpdateUsernameInput!): User
    deleteUser(id: ID!): User
  }

  type Subscription {
    messageCreated: Message!
    newUser: User!
  }

  enum Nationality {
    CANADA
    BRAZIL
    INDIA
    GERMANY
    CHILE
    UKRAINE
  }

  type Message {
    title: String
    content: String
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
