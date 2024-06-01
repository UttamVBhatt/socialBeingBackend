const Likes = require("./../models/likeModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");
const User = require("./../models/userModel");
const Posts = require("./../models/postModel");
const Comment = require("./../models/commentModel");

exports.likePost = catchAsync(async (req, res, next) => {
  const likedPost = await Likes.create(req.body);

  const user = await User.findById(req.body.user);

  user.likedPosts.unshift(req.body.post);

  await user.save({ validateBeforeSave: false });

  const post = await Posts.findById(req.body.post).populate("user");
  const comments = await Comment.find({ post: req.params.id });
  const likes = await Likes.find({ post: req.params.id });

  res.status(201).json({
    status: "success",
    message: "Liked Successfully",
    likedPost,
    user,
    // post,
    // comments,
    // likes,
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const allLikes = new APIFeatures(Likes.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .page();

  const postLikes = await allLikes.query;

  const user = await User.findById(req.body.user);

  const index = user.likedPosts.indexOf(req.body.post);

  user.likedPosts.splice(index, 1);

  const post = await Posts.findById(req.body.post).populate("user");
  const comments = await Comment.find({ post: req.params.id });
  const likes = await Likes.find({ post: req.params.id });

  await user.save({ validateBeforeSave: false });

  await Likes.findByIdAndDelete(postLikes[0].id);

  res.status(200).json({
    status: "success",
    message: "Unliked Successfully",
    user,
    // post,
    // comments,
    // likes,
  });
});

exports.getAllLikesOfAPostAndUsersLikedPosts = catchAsync(
  async (req, res, next) => {
    const allLikes = new APIFeatures(Likes.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .page();

    const likes = await allLikes.query;

    res.status(200).json({
      status: "success",
      noOfLikes: likes.length,
      data: {
        likes,
      },
    });
  }
);
