// Import required modules from Apollo Server
const { ApolloError, AuthenticationError } = require("apollo-server-express");

// Import database connection and schema
const { db } = require("../../../db/db");
const { Customers } = require("../../../db/schema/customer/customer");

// Import Drizzle ORM expressions
const { eq } = require("drizzle-orm/expressions");

// Import authentication configurations
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports = {
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
  },
};
