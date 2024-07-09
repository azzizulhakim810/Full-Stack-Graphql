const jwt = require("jsonwebtoken");

const getUser = async (token) => {
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.user;
    }
    return null;
  } catch (err) {
    console.log("Error verifying token:", err);
    return null;
  }
};

module.exports = { getUser };
