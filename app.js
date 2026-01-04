const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const recommendationRouter = require("./routes/recommendationRoutes");
const chatbotRouter = require("./routes/chatbotRoutes");
const sentimentRouter = require("./routes/sentimentRoutes");
const searchRouter = require("./routes/searchRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// 1) GLOBAl MIDDLEWARES
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "send too many requests from thi IP . please sned after a hour",
});
app.use("/api", limiter);

//body parser
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// data sanitize NoSQL quey injection
app.use(mongoSanitize());

//data sanitize
app.use(xss());
// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupsize",
      "diffculty",
      "price",
    ],
  })
);
// app.use(express.static(`${__dirname}/public`));
//test middleware
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/payment", bookingRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/sentiment", sentimentRouter);
app.use("/api/v1/search", searchRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
