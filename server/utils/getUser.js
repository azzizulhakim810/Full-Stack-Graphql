const jwt = require("jsonwebtoken");

const getUser = (token) => {
  if (token) {
    try {
      const decoded = jwt.verify(token, "UNSAFE_STRING");
      return decoded;
    } catch (err) {
      console.log("Error verifying token:", err);
      return null;
    }
  }
  return null;
};

module.exports = { getUser };
