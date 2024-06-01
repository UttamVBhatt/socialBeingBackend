const videoPostController = require("./../controllers/videoPostController");
const express = require("express");

const router = express.Router();

router.route("/").get(videoPostController.getAllPosts);

router.post(
  "/upload/:userId",
  videoPostController.uploadVideo,
  videoPostController.createVideoPost
);

router.post("/:id/:userId", videoPostController.savePost);

router
  .route("/:id")
  .get(videoPostController.getOnePost)
  .delete(videoPostController.deletePost);

router.patch("/:id/:userId", videoPostController.updatePost);

module.exports = router;
