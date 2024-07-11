// Import Neon module from @neondatabase/serverless
const { neon } = require("@neondatabase/serverless");

// Import drizzle function from drizzle-orm/neon-http
const { drizzle } = require("drizzle-orm/neon-http");

// Import schema from local file
const schema = require("./schema");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, {
  schema,
});

module.exports = { db };
