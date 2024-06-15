const mongoose = require("mongoose");
const { stringify } = require("uuid");

const plm = require("passport-local-mongoose");

mongoose.connect(`mongodb+srv://kanishk:kanishkmern@cluster0.99v5rcb.mongodb.net/instagramApp?retryWrites=true&w=majority&appName=Cluster0`);

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
    },
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  messages: {
    type: Array,
    default: [],
  },
  profilepicture: {
    type: String,
    default:'default.webp'
  },
  bio: String,
  password: String,
  email: String,
  socketId: {
    type: String,
  },
});

mongoose.plugin(plm);

module.exports = mongoose.model("user", userSchema);
