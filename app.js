const express = require("express");
const AppError = require("./utils/AppError");
const app = express();

// Importing Middlewares
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const helmet = require("helmet");

// Importing Global Error Handler
const globalErrorHandler = require("./controllers/errorHandler");

// Importing Routes
const userRouter = require("./routes/userRoute");
const followUnfollowRouter = require("./routes/followUnfollowRoute");
const postRouter = require("./routes/postRoute");
const likesRouter = require("./routes/likeRoute");
const commentRouter = require("./routes/commentRoute");
const videoRouter = require("./routes/videoPostRoute");

// Using Middlewares
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(xssClean());
app.use(cors());
app.use(cookieParser());

// Using Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/followuser", followUnfollowRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/video/posts", videoRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

// Using Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
