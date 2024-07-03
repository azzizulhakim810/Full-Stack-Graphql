const { MongoClient } = require("mongodb");
require("dotenv").config();
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@atlascluster.sztfigr.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;
const client = new MongoClient(url);

// Database Name
const dbName = "graphql_operations";

// Use connect method to connect to the server
client.connect();
console.log("Connected successfully to server");

const db = client.db(dbName);
const collection = db.collection("elements");

module.exports = { collection, db };
