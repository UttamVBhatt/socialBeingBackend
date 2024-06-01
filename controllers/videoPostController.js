const VideoPosts = require("./../models/videoPostModel");
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

//////// UPLOADING VIDEOS ///////

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/postVideos");
  },
  filename: (req, file, cb) => {
    cb(null, `video-${req.params.userId}-${file.originalname}`);
  },
});

const videoFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video") &&
    file.mimetype.split("/")[1] === "mp4"
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not an video file, plese upload only video files with mp4 extension",
        false
      )
    );
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
});

exports.uploadVideo = videoUpload.single("video");

exports.createVideoPost = catchAsync(async (req, res, next) => {
  const newPost = await VideoPosts.create(req.body);
  const user = await User.findById(req.params.userId);

  let upload;

  if (req.file) {
    upload = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "socialBeingVideos",
    });
  }

  if (!user) next(new AppError("No such user found with that ID", 404));

  if (req.file) {
    newPost.video = req.file.filename;
    newPost.videoURL = upload.secure_url;
  }

  user.videos.unshift(newPost.id);
  await user.save({ validateBeforeSave: false });

  newPost.user = user.id;
  await newPost.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Post Created Successfully",
    data: {
      newPost,
      user,
    },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const post = new APIFeatures(VideoPosts.find(), req.query)
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
  const post = await VideoPosts.findById(req.params.id).populate("user");

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
  const deletedPost = await VideoPosts.findById(req.params.id).populate("user");

  const user = deletedPost.user;

  const indexOfDeletedPost = user.videos.indexOf(deletedPost.id);
  user.videos.splice(indexOfDeletedPost, 1);

  await user.save({ validateBeforeSave: false });
  await VideoPosts.deleteOne(deletedPost);

  res.status(200).json({
    status: "success",
    message: "Post deleted Successfully",
    user,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await VideoPosts.findById(req.params.id);
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

  const updatedPost = await VideoPosts.findByIdAndUpdate(
    post.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

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
  const post = await VideoPosts.findById(req.params.id);

  if (user.savedVideos.includes(post.id)) {
    const index = user.savedVideos.indexOf(post.id);
    user.savedVideos.splice(index, 1);

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Removed from saved videos",
      user,
    });
  } else {
    user.savedVideos.unshift(post.id);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Video Saved Successfully",
      user,
    });
  }
});
