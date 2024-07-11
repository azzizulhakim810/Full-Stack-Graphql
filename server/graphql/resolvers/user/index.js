// Import required modules from Apollo Server
const { ApolloError, AuthenticationError } = require("apollo-server-express");

// Import the database connection and schema
const { db } = require("../../../db/db");
const { Users } = require("../../../db/schema/User/user");

// Import Drizzle ORM expressions
const { eq } = require("drizzle-orm/expressions");

module.exports = {
  Query: {
    users: async (_, { offset, limit }) => {
      try {
        const users = await db.select().from(Users).offset(offset).limit(limit);

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
  },

  Mutation: {
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
          .returning();

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
