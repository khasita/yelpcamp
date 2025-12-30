// User model for the login page

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { default: passportLocalMongoose } = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose); // adds username, hash and salt fields to store the username, the hashed password and the salt value.
module.exports = mongoose.model("User", UserSchema);
