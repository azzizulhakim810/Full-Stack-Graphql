const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { Customers } = require("./schema/customer/customer");
const { Messages } = require("./schema/message/message");
const schema = require("./schema");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, {
  schema,
});

module.exports = { db };
