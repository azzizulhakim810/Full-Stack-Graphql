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

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, pubSub }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  const subscriptionServer = SubscriptionServer.create(
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

/* const { ApolloServer } = require("apollo-server");
const { typeDefs } = require("./schema/type-defs");
const { resolvers } = require("./schema/resolvers");
const { PubSub } = require("graphql-subscriptions");

const pubsub1 = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    // return { name: "Azzizul" };
    {
      req, res, pubsub1;
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`YOUR API IS RUNNING AT: ${url} :)`);
});
 */
