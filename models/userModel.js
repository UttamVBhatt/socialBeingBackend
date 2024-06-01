const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    minlength: [3, "Your name must contain atleast 3 characters"],
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    validate: [validator.isEmail, "Please provide valid email address"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "Your password must contain atleast 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    minlength: [
      8,
      "Your password confirm field should not be differ from your actual password",
    ],
    validator: {
      validate: function (val) {
        return val === this.password;
      },
      message:
        "Both passwords are not the same, please again confirm your password",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  photo: String,
  imageURL: String,
  coverPhoto: String,
  coverImageURL: String,
  likedPosts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Posts",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Posts",
    },
  ],
  videos: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "VideoPosts",
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Posts",
    },
  ],
  savedVideos: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "VideoPosts",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  passwordResetToken: String,
  passwordResetExpires: Date,
  dateOfBirth: Date,
  description: {
    type: String,
    trim: true,
    minlength: [3, "Your description must contain at least 3 characters"],
  },
  city: {
    type: String,
    minlength: [2, "Your city's name should not be smaller than 2 characters"],
    trim: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.comparePasswords = async (
  requestedPassword,
  existedPassword
) => await bcrypt.compare(requestedPassword, existedPassword);

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha-256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 5 * 60 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
