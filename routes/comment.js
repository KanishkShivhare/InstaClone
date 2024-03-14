const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
      comment: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now
      }

});

module.exports = mongoose.model("comment", CommentSchema);