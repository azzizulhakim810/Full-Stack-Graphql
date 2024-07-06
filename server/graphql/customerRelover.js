const { ApolloError } = require("apollo-server-express");
const CustomerModel = require("../models/Customer");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CustomerModel
const resolvers = {
  Query: {
    customer: async (_, { ID }) => {
      try {
        const customer = await CustomerModel.findById(ID);
        return customer;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  },

  Mutation: {
    async registerUser(_, { registerInput: { cUsername, email, password } }) {

      // See if an old customer exists with email attempting to register
      const oldCustomer = await CustomerModel.findOne({ email });

      // Throw error if that customer exists
      if (oldCustomer) {
        throw new ApolloError(
          `A user is already registered this email, ${email}, 'USER_ALREADY_EXISTS'`
        );
      },


      // Encrypt password
      const encryptedPassword = await bcrypt.hash(password, 10)

      // Build out Mongoose model (Customer)
      const newCustomer = new CustomerModel({
        cUsername: cUsername,
        email: email.toLowercase(),
        password: encryptedPassword
      })

      // Create out JWT (attach to our Customer Model)

      const token = jwt.sign(
        {customer_id: newCustomer._id, email},
        "UNSAFE_STRING",
         { expiresIn: '2h' });

         newCustomer.token = token;
      // Save our customer to MongoDB

      const res = await newCustomer.save();

      return {
        id: res.id,
        ...res._doc
      }

    },
    async loginUser(_, { loginInput: {email, password } }) {

        // See if a user exists with the email
        const customer = await CustomerModel.findOne({ email });

        // Check if the entered password equals the encrypted password
        if (customer && (await bcrypt.campare(password, customer.password))) {
          
          // Create a NEW Token
          const token = jwt.sign(
            {customer_id: newCustomer._id, email},
            "UNSAFE_STRING",
             { expiresIn: '2h' });
             
         // Attach token a customer model that we found above 
        customer.token = token;

        return {
          id: customer.id,
          ...customer._doc
        }


        } else {

 // If user doesn't exist, send error
          throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD"), 
        }

       

      

       

    }


  },
};

module.exports = { resolvers };
