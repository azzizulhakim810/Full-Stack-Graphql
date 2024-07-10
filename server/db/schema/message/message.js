const { pgTable, text, serial } = require("drizzle-orm/pg-core");

const Messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

module.exports = { Messages };
