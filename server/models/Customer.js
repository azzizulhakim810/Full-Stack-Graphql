const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  cUsername: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
});

const CustomerModel = mongoose.model("Customer", customerSchema);

module.exports = CustomerModel;
