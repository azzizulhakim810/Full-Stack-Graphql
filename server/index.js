const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { createServer } = require("http");
const express = require("express");

// ** import third party
const dotenv = require("dotenv");
const { PubSub } = require("graphql-subscriptions");
const { ApolloServer } = require("apollo-server-express");
const { ApolloArmor } = require("@escape.tech/graphql-armor");

const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { GraphQLError } = require("graphql");

// ** import config
dotenv.config({ path: ".env.local" });

// ** import utils
const { getUser } = require("./utils/getUser");

const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/type-defs");

const PORT = process.env.PORT || 4000;

// Instantiate GraphQL Armor
const armor = new ApolloArmor({
  // Completely disable aliases for this lesson
  maxAliases: { n: 0 },
});

// Create express app & wrap it by httpServer
(async () => {
  const app = express();
  const httpServer = createServer(app);
  const pubSub = new PubSub();
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Initialize Instance of Apollo Server
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUser(token);
      return { req, pubSub, user };
    },
    playground: true,
    introspection: true,
    // Add the protections to the server
    ...armor.protect(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Create Subscription
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
