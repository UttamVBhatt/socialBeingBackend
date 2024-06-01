const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  photo: String,
  imageURL: String,
  video: String,
  videoURL: String,
  caption: {
    type: String,
    required: [true, "Please provide a caption for your post"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Posts = mongoose.model("Posts", postSchema);

module.exports = Posts;
