const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/AppError");
const sendMail = require("./../utils/sendMail");
const crypto = require("crypto");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_STRING, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, status, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(status).json({
    status: "success",
    token,
    data: {
      user,
      token,
      cookieOptions,
    },
  });
};

exports.SignUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    next(new AppError("Please provide your email or password", 401));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password)))
    next(new AppError("Please provide valid email or password", 404));

  createSendToken(user, 200, res);
});

exports.logOut = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 60 * 1000),
    httpOnly: true,
  };

  const token = "Logged Out";

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logged Out Successfully",
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) next(new AppError("No such user found with that email", 404));

  const resetPasswordToken = user.createResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `http://localhost:5173/reset/password/${resetPasswordToken}`;

    const message = `Forgot your password ? Please follow the link \n\n ${resetURL}\n and provide your new password and password confirm on it. Your password Reset Token is valid for just 5 minutes.\n\n  Note :- If you haven't requested this email than please ignore this...`;

    sendMail({
      to: user.email,
      subject: "Reset Your Password",
      message,
    });

    res.status(200).json({
      status: "success",
      message:
        "Email Sent Successfully, please check your email / spam folder for reset password link.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email, please try again later"
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha-256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) next(new AppError("Token is invalid or expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

exports.getLoggedInUser = catchAsync(async (req, res, next) => {
  const token = req.params.token;

  if (!token) next(new AppError("Please provide a token", 400));

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_STRING
  );

  const user = await User.findById(decoded.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
