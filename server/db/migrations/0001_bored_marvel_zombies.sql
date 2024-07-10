CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"nationality" varchar(255) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
