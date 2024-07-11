const customerResolvers = require("./customer");
const messageResolvers = require("./message");
const userResolvers = require("./user");

module.exports = {
  Subscription: {
    ...messageResolvers.Subscription,
  },

  Query: {
    ...customerResolvers.Query,
    ...messageResolvers.Query,
    ...userResolvers.Query,
  },

  Mutation: {
    ...customerResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...userResolvers.Mutation,
  },

  UserResult: {
    ...userResolvers.UserResult,
  },
};
