const FollowUnfollow = require("./../models/followUnfollowModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const User = require("../models/userModel");

exports.FollowUser = catchAsync(async (req, res, next) => {
  const followedUser = await FollowUnfollow.create(req.body);

  const user = await User.findById(req.body.follower);
  const userToFollow = await User.findById(req.body.following).populate(
    "followers following posts savedPosts"
  );

  if (user.following.includes(userToFollow.id))
    return res.status(200).json({
      status: "success",
      message: "You already follow this user",
    });

  user.following.unshift(req.body.following);
  userToFollow.followers.unshift(req.body.follower);

  await user.save({ validateBeforeSave: false });
  await userToFollow.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    message: "Followed Successfully",
    user,
    userToFollow,
  });
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  const userToUnfollow = await User.findById(req.params.followingId).populate(
    "followers following posts savedPosts"
  );

  if (!user || !userToUnfollow)
    next(
      new AppError("Please provide valid userID or Following User's ID", 404)
    );

  const doc = await FollowUnfollow.findOne({
    following: req.params.followingId,
    follower: req.params.userId,
  });

  await FollowUnfollow.findByIdAndDelete(doc.id);

  const index = user.following.indexOf(req.params.followingId);
  user.following.splice(index, 1);

  const myIndexIntoFollowedUser = userToUnfollow.followers.indexOf(
    req.params.userId
  );
  userToUnfollow.followers.splice(myIndexIntoFollowedUser, 1);

  await user.save({ validateBeforeSave: false });
  await userToUnfollow.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Unfollowed Successfully",
    user,
    userToUnfollow,
  });
});

exports.getAllFollowingsOfAUser = catchAsync(async (req, res, next) => {
  const allFollowingUsers = await FollowUnfollow.find({
    follower: req.params.id,
  });

  const myAllFollowings = allFollowingUsers.map(async (obj) => {
    return await User.findById(obj.following);
  });

  const allFollowings = await Promise.all(myAllFollowings);

  res.status(200).json({
    status: "success",
    noOfFollowing: allFollowings.length,
    allFollowings,
  });
});

exports.getAllFollowersOfAUser = catchAsync(async (req, res, next) => {
  const allFollowerUsers = await FollowUnfollow.find({
    following: req.params.id,
  });

  const myAllFollowers = allFollowerUsers.map(async (obj) => {
    return await User.findById(obj.follower);
  });

  const allFollowers = await Promise.all(myAllFollowers);

  res.status(200).json({
    status: "success",
    noOfFollowers: allFollowers.length,
    allFollowers,
  });
});
