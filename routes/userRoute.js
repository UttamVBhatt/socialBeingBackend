const express = require("express");

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.SignUp);
router.post("/login", authController.logIn);
router.get("/logout", authController.logOut);

router.route("/").get(userController.getAllUsers);

router.get("/search", userController.getSearchUsers);

router.post("/forgot/password", authController.forgotPassword);
router.post("/reset/password/:token", authController.resetPassword);

router.get("/loggedin/:token", authController.getLoggedInUser);

router.post(
  "/uploadphoto/:id",
  userController.uploadPhoto,
  userController.uploadMyPhoto
);

router.post(
  "/upload/coverphoto/:id",
  userController.uploadPhoto,
  userController.uploadCoverPhoto
);

router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

module.exports = router;
