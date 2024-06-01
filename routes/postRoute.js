const postController = require("./../controllers/postController");
const express = require("express");

const router = express.Router();

router.route("/").get(postController.getAllPosts);

router.post("/:userId", postController.uploadPhoto, postController.createPost);

router.post("/:id/:userId", postController.savePost);

router.get("/search", postController.getSearchPosts);

router
  .route("/:id")
  .get(postController.getOnePost)
  .delete(postController.deletePost);

router.patch("/:id/:userId", postController.updatePost);

module.exports = router;
