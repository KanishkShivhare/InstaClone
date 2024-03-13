const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  caption: String,
  date: {
    type: Date,
    defult: Date.now
  },
  image:String,
  likes:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  Comments:[
    {
      type: Array,
      default:[],
    }
  ],

});

module.exports = mongoose.model("post", postSchema);
