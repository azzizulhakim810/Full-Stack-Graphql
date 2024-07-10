const { pgTable, serial, varchar, text } = require("drizzle-orm/pg-core");

const Customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  token: text("token").notNull(),
});

module.exports = { Customers };
