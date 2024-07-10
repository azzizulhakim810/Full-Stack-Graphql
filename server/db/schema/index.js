const { Customers } = require("./customer/customer");
const { Messages } = require("./message/message");
const { Users } = require("./User/user");

console.log({ Customers });
console.log({ Messages });
console.log({ Users });

module.exports = {
  Customers,
  Messages,
  Users,
};
