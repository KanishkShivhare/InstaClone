const mongoose = require("mongoose");

const msgSchema = mongoose.Schema({
    sender: {
        type: String,
        required: true
      },
      receiver: {
        type: String,
        required: true
      },
      message: {
        type: String,
      },
      post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "post",
        },
      
      date: {
        type: Date,
        default: Date.now
      }

});

module.exports = mongoose.model("message", msgSchema);











