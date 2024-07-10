const { PubSub } = require("graphql-subscriptions");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Message = require("../models/Message");
const UserModel = require("../models/User");
const Customer = require("../models/Customer");
const { Customers } = require("../db/schema/customer/customer");
const { Users } = require("../db/schema/User/user");
const { db } = require("../db/db");
const { eq } = require("drizzle-orm/expressions");
const { Messages } = require("../db/schema/message/message");
const { v4: uuidv4 } = require("uuid");

const pubSub = new PubSub();

const resolvers = {
  Subscription: {
    messageCreated: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_CREATED"),
    },
  },

  Query: {
    customer: async (_, { email }) => {
      try {
        // const customer = await Customer.findById(ID);
        const customerResult = await db
          .select()
          .from(Customers)
          .where(eq(Customers.email, email));

        const customer = customerResult[0]; // Assuming email is unique and we get at most one record

        // Check if customer exists
        if (!customer) {
          throw new ApolloError(
            "Customer not found with this email",
            "CUSTOMER_NOT_FOUND"
          );
        }

        return {
          id: customer.id,
          username: customer.username,
          email: customer.email,
        };
      } catch (error) {
        console.error("Error in finding the customer:", error);
        throw new ApolloError("Error in finding the customer");
      }
    },

    customers: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to view customers"
        );
      }

      try {
        const customers = await db.select().from(Customers);
        return customers;
      } catch (error) {
        return { message: "Error fetching customers" };
      }
    },

    users: async (_, { offset, limit }) => {
      try {
        const users = await db.select().from(Users).offset(offset).limit(limit);

        /*  const totalCount = await db
          .select(db.raw("COUNT(*)"))
          .from(Users)
          .first()
          .then((result) => parseInt(result.count, 10)); */

        return { users };
      } catch (error) {
        console.error("Error fetching users:", error);
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

    userByName: async (parent, { name }) => {
      try {
        const users = await db
          .select()
          .from(Users)
          .where(eq(Users?.name, name.toLowerCase()));

        const user = users.length > 0 ? users[0] : null;

        if (!user) {
          throw new Error(`User with name ${name} not found`);
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          age: user.age,
          nationality: user.nationality,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    },

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
      try {
        // Log input values
        console.log(
          `Registering customer with email: ${email}, username: ${username}`
        );

        // Check if a customer with the same email already exists
        const oldCustomer = await db
          .select()
          .from(Customers)
          .where(eq(Customers.email, email));
        console.log(
          `Old customer check result: ${JSON.stringify(oldCustomer)}`
        );

        if (oldCustomer.length > 0) {
          throw new ApolloError(
            `A user is already registered with this email: ${email}`,
            "USER_ALREADY_EXISTS"
          );
        }

        // Encrypt password
        const encryptedPassword = await bcrypt.hash(password, 10);
        console.log(`Encrypted password: ${encryptedPassword}`);

        // Generate a token
        const token = jwt.sign(
          { email },
          process.env.JWT_SECRET || "UNSAFE_STRING",
          { expiresIn: process.env.TOKEN_EXPIRY_TIME || "2h" }
        );
        console.log(`Generated token: ${token}`);

        // Create the new customer record with the token
        const [newCustomer] = await db
          .insert(Customers)
          .values({
            username,
            email,
            password: encryptedPassword,
            token,
          })
          .returning();

        console.log(`New customer created: ${JSON.stringify(newCustomer)}`);

        return {
          id: newCustomer.id,
          username: newCustomer.username,
          email: newCustomer.email,
          password: newCustomer.password,
          token,
        };
      } catch (error) {
        console.error("Error in registerCustomer:", error);
        throw new ApolloError("Error registering customer");
      }
    },

    async loginCustomer(_, { loginInput: { email, password } }) {
      try {
        console.log(`Logging in customer with email: ${email}`);

        // Fetch customer from database
        const customerResult = await db
          .select()
          .from(Customers)
          .where(eq(Customers.email, email));

        const customer = customerResult[0]; // Assuming email is unique and we get at most one record

        // Check if customer exists
        if (!customer) {
          throw new ApolloError(
            "Customer not found with this email",
            "CUSTOMER_NOT_FOUND"
          );
        }

        // Check if password matches
        const passwordValid = await bcrypt.compare(password, customer.password);
        if (!passwordValid) {
          throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
        }

        // Generate JWT token
        const token = jwt.sign(
          { customer_id: customer.id, email },
          process.env.JWT_SECRET || "UNSAFE_STRING",
          { expiresIn: "2h" }
        );

        // Update customer record with token
        await db
          .update(Customers)
          .set({ token })
          .where(eq(Customers.id, customer.id));

        // Return customer data with token, omitting password
        return {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          token,
        };
      } catch (error) {
        console.error("Error in loginCustomer:", error);
        throw new ApolloError("Error logging in customer");
      }
    },

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

    createUser: async (_, args) => {
      const userInput = args.input;
      console.log(args);

      const newUser = {
        name: userInput.name,
        username: userInput.username,
        age: userInput.age,
        nationality: userInput.nationality,
      };

      try {
        const res = await db.insert(Users).values(newUser).returning();
        return res[0]; // Ensure you return the created user object
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    },

    updateUsername: async (parent, { input }) => {
      const { id, newUsername } = input;
      try {
        const [updatedUser] = await db
          .update(Users)
          .set({ username: newUsername })
          .where(eq(Users.id, id))
          .returning(); // This returns the updated user

        if (!updatedUser) {
          throw new Error("User not found");
        }

        return {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          age: updatedUser.age,
          nationality: updatedUser.nationality,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    deleteUser: async (parent, { id }) => {
      try {
        const deleteResult = await db.delete(Users).where(eq(Users.id, id));

        if (deleteResult.rowCount === 0) {
          return "User not found";
        }

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
