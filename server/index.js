const dotenv = require("dotenv");
dotenv.config();

const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { PubSub } = require("graphql-subscriptions");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const { resolvers } = require("./graphql/resolvers");
const { typeDefs } = require("./graphql/type-defs");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { GraphQLError } = require("graphql");
const { getUser } = require("./utils/getUser"); // Assuming you have a function to get the user from a token

const PORT = process.env.PORT || 4000;

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connected!!");
  })
  .catch((err) => console.log(err));

(async () => {
  const app = express();
  const httpServer = createServer(app);
  const pubSub = new PubSub();
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Configure ApolloServer
  const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
      // get the user token from the headers
      const token = req.headers.authorization || "";

      // console.log("Received token:", token);

      // try to retrieve a user with the token
      const user = getUser(token);

      // optionally block the user
      // we could also check user roles/permissions here
      if (!user)
        // throwing a `GraphQLError` here allows us to specify an HTTP status code,
        // standard `Error`s will have a 500 status code by default
        throw new GraphQLError("User is not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
            http: { status: 401 },
          },
        });

      // Add the user and pubSub to the context
      return { req, res, pubSub, user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Configure Subscription
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => console.log("Connected to websocket"),
      onDisconnect: () => console.log("Disconnected from websocket"),
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );

  await server.start();
  server.applyMiddleware({ app });

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
})();
