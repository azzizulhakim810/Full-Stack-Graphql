const { UserList, MovieList } = require("../FakeData");
const _ = require("lodash");
// const { PubSub } = require("apollo-server");
const { PubSub } = require("graphql-subscriptions");
const Message = require("../models/Message");
const User = require("../models/User");

// const NEW_USER = "NEW_USER";

const pubSub = new PubSub();

const resolvers = {
  Subscription: {
    /*  newUser: {
      subscribe: (_, __, { pubsub1 }) => pubsub1.asyncIterator(NEW_USER),
    }, */

    messageCreated: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_CREATED"),
    },
  },

  Query: {
    // USER RESOLVERS
    users: async (parent, args, context, info) => {
      // Get the info from root context
      // console.log(context);
      // console.log(context.req.headers);
      // console.log(info);

      // From local DB
      /* if (UserList) return { users: UserList };
      return { message: "Yo, there wan an error" }; */

      try {
        const users = await User.find(); // Fetch all users from MongoDB
        return { users };
      } catch (error) {
        return { message: "Error fetching users" };
      }
    },

    user: async (parents, args) => {
      /*   const id = args.id;
      const user = _.find(UserList, { id: Number(id) });
      return user; */

      try {
        const user = await User.findById(args.id); // Fetch user by ID from MongoDB
        return user;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    // MOVIE RESOLVERS
    movies: () => {
      return MovieList;
    },

    movie: (parent, args) => {
      const name = args.name;
      const movie = _.find(MovieList, { name });
      return movie;
    },

    message: (_, { ID }) => Message.findById(ID),
  },

  User: {
    favoriteMovies: () => {
      return _.filter(
        MovieList,
        (movie) =>
          movie.yearOfPublication >= 2000 && movie.yearOfPublication <= 2010
      );
    },
  },

  Mutation: {
    async createMessage(_, { messageInput: { title, content } }) {
      const newMessage = new Message({
        title: title,
        content: content,
      });

      const res = await newMessage.save();

      pubSub.publish("MESSAGE_CREATED", {
        messageCreated: {
          title: title,
          content: content,
        },
      });

      return {
        id: res.id,
        ...res._doc,
      };
    },

    async createUser(parent, args) {
      const userInput = args.input;
      const newUser = new User(userInput);
      await newUser.save();
      return newUser;
      /* 
      const lastId = UserList[UserList.length - 1].id;
      userInput.id = lastId + 1;
      UserList.push(userInput); 
      return userInput;*/
    },

    updateUsername: async (parent, args) => {
      const { id, newUsername } = args.input;
      /*    let userUpdated;
      UserList.forEach((user) => {
        if (user.id === Number(id)) {
          console.log(user.username, newUsername);
          user.username = newUsername;
          userUpdated = user;
        }
      });

      return userUpdated; */

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
      /*  _.remove(UserList, (user) => user.id === Number(id));
      return null; */

      try {
        await User.findByIdAndDelete(id);
        return "User deleted successfully";
      } catch (error) {
        console.error(error);
        return "Error deleting user";
      }
    },

    /* login: async (_, { input: { email, password } }, context) => {
      const user = await UserModel.findOne({
        $and: [{ email: email }, { password: password }],
      });
      if (user) {
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_PRIVATE_KEY,
          { expiresIn: process.env.TOKEN_EXPIRY_TIME }
        );
        return {
          ...user._doc,
          userJwtToken: {
            token: token,
          },
        };
      }
      //if user doesn't exists
      throwCustomError(
        'Invalid email or password entered.',
        ErrorTypes.BAD_USER_INPUT
      );
    }, */
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
