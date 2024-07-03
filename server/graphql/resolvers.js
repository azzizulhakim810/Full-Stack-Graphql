const { UserList, MovieList } = require("../FakeData");
const _ = require("lodash");
// const { PubSub } = require("apollo-server");
const { PubSub } = require("graphql-subscriptions");
const Message = require("../models/Message");

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
    users: (parent, args, context, info) => {
      // Get the info from root context
      // console.log(context);
      // console.log(context.req.headers);
      // console.log(info);

      if (UserList) return { users: UserList };
      return { message: "Yo, there wan an error" };

      // Add database to fetch here
      // return UserList;
    },

    user: (parents, args) => {
      const id = args.id;
      const user = _.find(UserList, { id: Number(id) });
      return user;
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

    createUser: (parent, args) => {
      const user = args.input;
      const lastId = UserList[UserList.length - 1].id;
      user.id = lastId + 1;
      UserList.push(user);
      return user;
    },

    updateUsername: (parent, args) => {
      const { id, newUsername } = args.input;
      let userUpdated;
      UserList.forEach((user) => {
        if (user.id === Number(id)) {
          console.log(user.username, newUsername);
          user.username = newUsername;
          userUpdated = user;
        }
      });

      return userUpdated;
    },

    deleteUser: (parent, args) => {
      const id = args.id;
      _.remove(UserList, (user) => user.id === Number(id));
      return null;
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
