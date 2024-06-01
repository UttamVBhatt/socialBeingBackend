const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Posts",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
    required: [true, "You can't provide empty comments"],
    trim: true,
    minlenght: [1, "Your comment must contain at least 1 character"],
  },
});

commentSchema.pre(/^find/, function (next) {
  this.populate("post user");
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
