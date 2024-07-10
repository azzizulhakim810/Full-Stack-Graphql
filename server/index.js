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
const { getUser } = require("./utils/getUser");

const PORT = process.env.PORT || 4000;

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

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUser(token);
      return { req, pubSub, user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

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
