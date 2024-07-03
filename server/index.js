const dotenv = require("dotenv");
dotenv.config();

const { createServer } = require("http");
const { subscribe, execute } = require("graphql");
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
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected!!");
  })
  .catch((err) => console.log(err));

(async () => {
  const app = express();
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const httpServer = createServer(app);
  const pubSub = new PubSub();

  // console.log(typeDefs); // Add this line to log the typeDefs

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, pubSub }),
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
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
