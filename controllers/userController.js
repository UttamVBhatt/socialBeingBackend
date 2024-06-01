const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const APIFeatures = require("./../utils/APIFeatures");
const Likes = require("../models/likeModel");

cloudinary.config({
  cloud_name: "dd9txketg",
  api_key: "877765274648393",
  api_secret: "HO3B6pXsF8kjVTIiOwDecbw-oHI",
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/userImages");
  },
  filename: (req, file, cb) => {
    cb(null, `user-${req.params.id}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, please upload only images"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");

exports.uploadMyPhoto = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  const upload = await cloudinary.uploader.upload(req.file.path, {
    folder: "socialBeing",
  });

  if (req.file) {
    user.photo = req.file.filename;
    user.imageURL = upload.secure_url;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Uploaded Successfully",
    user,
  });
});

exports.uploadCoverPhoto = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  const upload = await cloudinary.uploader.upload(req.file.path, {
    folder: "socialBeingUserCoverPhoto",
  });

  if (req.file) {
    user.coverPhoto = req.file.filename;
    user.coverImageURL = upload.secure_url;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Uploaded Successfully",
    user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    next(new AppError("This route is not for updating the passwords"));

  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "city",
    "description"
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Updated Successfully",
    data: {
      updatedUser,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .page()
    .search();

  const users = await user.query;

  res.status(200).json({
    status: "success",
    noOfUsers: users.length,
    data: {
      users,
    },
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    "posts savedPosts followers following"
  );

  if (!user) {
    return next(new AppError("No such user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  const followers = user.followers.map(async (id) => {
    const followers = await User.findById(id);
    const index = followers.following.indexOf(req.params.id);
    followers.following.splice(index, 1);
    await followers.save({ validateBeforeSave: false });
  });

  await Promise.all(followers);

  const following = user.following.map(async (id) => {
    const following = await User.findById(id);
    const index = following.followers.indexOf(req.params.id);
    following.followers.splice(index, 1);
    await following.save({ validateBeforeSave: false });
  });

  await Promise.all(following);

  await user.save({ validateBeforeSave: false });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Deleted Successfully",
  });
});

exports.getSearchUsers = catchAsync(async (req, res, next) => {
  const keyword = req.query.keyword;

  if (!keyword) next(new AppError("Please provide a keyword", 400));

  const users = await User.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
  });

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});
