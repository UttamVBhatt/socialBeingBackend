const mongoose = require("mongoose");

const videoPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
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

const VideoPosts = mongoose.model("VideoPosts", videoPostSchema);

module.exports = VideoPosts;
