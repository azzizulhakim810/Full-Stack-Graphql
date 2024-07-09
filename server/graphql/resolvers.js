const { PubSub } = require("graphql-subscriptions");
const { ApolloError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Message = require("../models/Message");
const UserModel = require("../models/User");
const Customer = require("../models/Customer");

const pubSub = new PubSub();

const resolvers = {
  Subscription: {
    messageCreated: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_CREATED"),
    },
  },

  Query: {
    customer: async (_, { ID }) => {
      try {
        const customer = await Customer.findById(ID);
        return customer;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    customers: async () => {
      try {
        const customers = await Customer.find();
        return customers;
      } catch (error) {
        return { message: "Error fetching customers" };
      }
    },

    users: async (_, { offset, limit }) => {
      try {
        const users = await UserModel.find().skip(offset).limit(limit);
        const totalCount = await UserModel.length;

        return { users, totalCount };
      } catch (error) {
        return { message: "Error fetching users" };
      }
    },

    user: async (parent, args) => {
      try {
        const user = await UserModel.findById(args.id);
        return user;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    userByName: async (parent, args) => {
      try {
        const user = await UserModel.findOne({ name: args.name });
        console.log(user);
        return user;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    messages: async () => {
      try {
        const messages = await Message.find();
        // console.log(messages);
        return messages;
      } catch (error) {
        return { message: "Error fetching message" };
      }
    },

    message: async (parent, { id }) => {
      try {
        const message = await Message.findById(id);
        return message;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  },
  Mutation: {
    async registerCustomer(
      _,
      { registerInput: { username, email, password } }
    ) {
      // See if an old customer exists with email attempting to register
      const oldCustomer = await Customer.findOne({ email });

      // Throw error if that customer exists
      if (oldCustomer) {
        throw new ApolloError(
          `A user is already registered this email, ${email}, 'USER_ALREADY_EXISTS'`
        );
      }

      // Encrypt password
      const encryptedPassword = await bcrypt.hash(password, 10);

      // Build out Mongoose model (Customer)
      const newCustomer = new Customer({
        username: username,
        email: email,
        password: encryptedPassword,
      });

      // Create out JWT (attach to our Customer Model)

      const token = jwt.sign(
        { customer_id: newCustomer._id, email },
        "UNSAFE_STRING",
        { expiresIn: "2h" }
      );

      newCustomer.token = token;
      // Save our customer to MongoDB

      const res = await newCustomer.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },

    async loginCustomer(_, { loginInput: { email, password } }) {
      // See if a user exists with the email
      const customer = await Customer.findOne({ email });

      // Check if the entered password equals the encrypted password
      if (customer && (await bcrypt.compare(password, customer.password))) {
        // Create a NEW Token
        const token = jwt.sign(
          { customer_id: customer._id, email },
          "UNSAFE_STRING",
          { expiresIn: "2h" }
        );

        // Attach token a customer model that we found above
        customer.token = token;

        return {
          id: customer.id,
          ...customer._doc,
        };
      } else {
        // If user doesn't exist, send error
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },

    createMessage: async (parent, { messageInput: { title, content } }) => {
      const newMessage = new Message({ title, content });
      const res = await newMessage.save();

      pubSub.publish("MESSAGE_CREATED", {
        messageCreated: res,
      });

      return res;
    },

    createUser: async (_, args, info, context) => {
      const userInput = args.input;
      console.log(args);
      const newUser = new UserModel(userInput);
      try {
        await newUser.save();
        return newUser; // Ensure you return the created user object
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    },

    updateUsername: async (parent, args) => {
      const { id, newUsername } = args.input;
      try {
        const user = await UserModel.findByIdAndUpdate(
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
        await UserModel.findByIdAndDelete(id);
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
