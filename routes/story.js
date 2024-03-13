const mongoose = require("mongoose");

const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    defult: Date.now,
  },
  image:String,
  likes:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
});

module.exports = mongoose.model("story", storySchema);
