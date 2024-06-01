const express = require("express");

const followUnfollowController = require("./../controllers/followUnfollowController");

const router = express.Router();

router.post("/follow", followUnfollowController.FollowUser);

router.delete(
  "/unfollow/:userId/:followingId",
  followUnfollowController.unFollowUser
);

router.get(
  "/getallfollowing/:id",
  followUnfollowController.getAllFollowingsOfAUser
);

router.get(
  "/getallfollowers/:id",
  followUnfollowController.getAllFollowersOfAUser
);

module.exports = router;
