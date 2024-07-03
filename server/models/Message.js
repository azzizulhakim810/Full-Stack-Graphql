const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  title: String,
  content: String,
});

module.exports = model("Message", messageSchema);
