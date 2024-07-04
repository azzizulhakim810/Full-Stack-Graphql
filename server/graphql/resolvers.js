const { PubSub } = require("graphql-subscriptions");
const Message = require("../models/Message");
const User = require("../models/User");

const pubSub = new PubSub();

const resolvers = {
  Subscription: {
    messageCreated: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_CREATED"),
    },
  },
  Query: {
    users: async () => {
      try {
        const users = await User.find();

        return { users };
      } catch (error) {
        return { message: "Error fetching users" };
      }
    },
    user: async (parent, args) => {
      try {
        const user = await User.findById(args.id);
        return user;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    message: async (parent, { ID }) => {
      try {
        const message = await Message.findById(ID);
        return message;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  },
  Mutation: {
    createMessage: async (parent, { messageInput: { title, content } }) => {
      const newMessage = new Message({ title, content });
      const res = await newMessage.save();

      pubSub.publish("MESSAGE_CREATED", {
        messageCreated: res,
      });

      return res;
    },
    createUser: async (parent, args) => {
      const userInput = args.input;
      const newUser = new User(userInput);
      await newUser.save();
      return newUser;
    },
    updateUsername: async (parent, args) => {
      const { id, newUsername } = args.input;
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { username: newUsername },
          { new: true }
        );
        return user;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    deleteUser: async (parent, args) => {
      const id = args.id;
      try {
        await User.findByIdAndDelete(id);
        return "User deleted successfully";
      } catch (error) {
        console.error(error);
        return "Error deleting user";
      }
    },
  },

  UserResult: {
    __resolveType(obj) {
      if (obj.users) {
        return "UserSuccessfullResult";
      }
      if (obj.message) {
        return "UserErrorResult";
      }
      return null;
    },
  },
};

module.exports = { resolvers };
