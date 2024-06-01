const mongoose = require("mongoose");

const followUnfollowSchema = new mongoose.Schema({
  following: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  follower: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const FollowUnfollow = mongoose.model("FollowUnfollow", followUnfollowSchema);

module.exports = FollowUnfollow;
