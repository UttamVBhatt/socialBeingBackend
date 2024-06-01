const Posts = require("./../models/postModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Comment = require("./../models/commentModel");
const Likes = require("../models/likeModel");

cloudinary.config({
  cloud_name: "dd9txketg",
  api_key: "877765274648393",
  api_secret: "HO3B6pXsF8kjVTIiOwDecbw-oHI",
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/postImages");
  },
  filename: (req, file, cb) => {
    cb(null, `post-${req.params.userId}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image , please upload only image files", false));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Posts.create(req.body);
  const user = await User.findById(req.params.userId);

  let upload;

  if (req.file)
    upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "socialBeingPosts",
    });

  if (!user) next(new AppError("No such user found with that ID", 404));

  if (req.file) {
    newPost.photo = req.file.filename;
    newPost.imageURL = upload.secure_url;
  }

  user.posts.unshift(newPost.id);
  await user.save({ validateBeforeSave: false });

  newPost.user = user.id;
  await newPost.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    message: "Post created Successfully",
    data: { newPost, user },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const post = new APIFeatures(Posts.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .page()
    .search();

  const posts = await post.query.populate("user");

  res.status(200).json({
    status: "success",
    noOfPosts: posts.length,
    data: {
      posts,
    },
  });
});

exports.getOnePost = catchAsync(async (req, res, next) => {
  const post = await Posts.findById(req.params.id).populate("user");

  const comments = await Comment.find({ post: req.params.id });

  const likes = await Likes.find({ post: req.params.id });

  if (!post) next(new AppError("No such post found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      post,
      comments,
      likes,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const deletedPost = await Posts.findById(req.params.id).populate("user");

  const user = deletedPost.user;

  const indexOfDeletedPost = user.posts.indexOf(deletedPost.id);
  user.posts.splice(indexOfDeletedPost, 1);

  await user.save({ validateBeforeSave: false });
  await Posts.deleteOne(deletedPost);

  res.status(200).json({
    status: "success",
    message: "Post deleted Successfully",
    user,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Posts.findById(req.params.id);
  const user = await User.findById(req.params.userId);

  if (!post) next(new AppError("No such post found with that ID", 404));

  const filteredObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  const filteredBody = filteredObj(req.body, "caption");

  const updatedPost = await Posts.findByIdAndUpdate(post.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Post Updated Successfully",
    data: {
      updatedPost,
      user,
    },
  });
});

exports.savePost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  const post = await Posts.findById(req.params.id);

  if (user.savedPosts.includes(post.id)) {
    const index = user.savedPosts.indexOf(post.id);
    user.savedPosts.splice(index, 1);

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Removed from saved posts",
      user,
    });
  } else {
    user.savedPosts.unshift(post.id);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Post Saved Successfully",
      user,
    });
  }
});

exports.getSearchPosts = catchAsync(async (req, res, next) => {
  const keyword = req.query.keyword;

  if (!keyword) next(new AppError("Please provide a keyword", 400));

  const posts = await Posts.find({
    caption: { $regex: keyword, $options: "i" },
  }).populate("user");

  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
});
