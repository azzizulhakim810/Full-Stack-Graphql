// Import required modules from Apollo Server
const { ApolloError, AuthenticationError } = require("apollo-server-express");

// Import PubSub from graphql-subscriptions
const { PubSub } = require("graphql-subscriptions");

// Import database connection and schema
const { db } = require("../../../db/db");
const { Messages } = require("../../../db/schema/message/message");

// Initialize PubSub instance
const pubSub = new PubSub();

module.exports = {
  Subscription: {
    messageCreated: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_CREATED"),
    },
  },

  Query: {
    messages: async () => {
      try {
        // const messages = await Message.find();
        const messages = await db.select().from(Messages);
        // console.log(messages);
        return messages;
      } catch (error) {
        return { message: "Error fetching message" };
      }
    },
  },

  Mutation: {
    async createMessage(parent, { messageInput: { title, content } }) {
      try {
        // Build out Drizzle ORM model (Message)
        const newMessage = {
          title: title,
          content: content,
        };

        // Save the new message to PostgreSQL
        const res = await db.insert(Messages).values(newMessage).returning();

        const createdMessage = res[0];

        pubSub.publish("MESSAGE_CREATED", {
          messageCreated: createdMessage,
        });

        return createdMessage;
      } catch (error) {
        console.error("Error creating message:", error);
        throw new ApolloError("Failed to create message");
      }
    },
  },
};
