const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoConnectionString");

// connect to mongoDB Using Mongoose library
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
