const Comment = require("./../models/commentModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");

exports.createComment = catchAsync(async (req, res, next) => {
  const newComment = await Comment.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Comment Added",
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedComment)
    next(new AppError("No such document found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Comment Updated Successfully",
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Comment Deleted Successfully",
  });
});

exports.getAllCommentsOfAPostAndMyComments = catchAsync(
  async (req, res, next) => {
    const allComments = new APIFeatures(Comment.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .page();

    const comments = await allComments.query;

    res.status(200).json({
      status: "success",
      noOfComments: comments.length,
      comments,
    });
  }
);
