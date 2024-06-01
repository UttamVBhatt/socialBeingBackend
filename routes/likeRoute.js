const express = require("express");
const likesController = require("./../controllers/likesController");

const router = express.Router();

router
  .route("/")
  .get(likesController.getAllLikesOfAPostAndUsersLikedPosts)
  .post(likesController.likePost)
  .delete(likesController.unlikePost);

module.exports = router;
