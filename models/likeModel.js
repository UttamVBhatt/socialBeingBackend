const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Posts",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

likeSchema.pre(/^find/, function (next) {
  this.populate("post user");
  next();
});

const Likes = mongoose.model("Likes", likeSchema);

module.exports = Likes;
