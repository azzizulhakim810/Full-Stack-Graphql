const { pgTable, serial, varchar, integer } = require("drizzle-orm/pg-core");

const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  age: integer("age").notNull(),
  nationality: varchar("nationality", { length: 255 }).notNull(),
});

module.exports = { Users };
