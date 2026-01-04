const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAysnc = require("./../utils/catchAsync");
const Apperror = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpsOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.select = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAysnc(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});
exports.login = catchAysnc(async (req, res, next) => {
  const { email, password } = req.body;

  // email and password not available
  if (!email || !password) {
    return next(new Apperror("Please enter email or password", 400));
  }
  // check if email and password are correct

  const user = await User.findOne({ email }).select("+password");

  // Check if user exists first, then verify password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Apperror("Invalid email or password", 401));
  }
  // send token
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpsOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAysnc(async (req, res, next) => {
  // getting  token and it is available or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new Apperror("You are not logged in !", 401));
  }

  // verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // if user was deleted account
  const currentUser = await User.findById(decode.id);
  // console.log(currentUser);
  if (!currentUser) {
    return next(new Apperror("token is doesn't exits"), 401);
  }

  // check if password change after token issue
  if (currentUser.changePassword(decode.iat)) {
    return next(
      new Apperror("User recently change password! please login again", 401)
    );
  }
  // grant access user
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// only use for rendering pages
exports.isLoggedIn = async (req, res, next) => {
  try {
    // getting  token and it is available or not
    if (req.cookies.jwt) {
      // verification token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // if user was deleted account
      const currentUser = await User.findById(decode.id);

      if (!currentUser) {
        return next(new Apperror("token is doesn't exits"), 401);
      }

      // check if password change after token issue
      if (currentUser.changePassword(decode.iat)) {
        return next();
      }

      // Logged user
      res.locals.user = currentUser;
      // console.log(res.locals.user);
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
exports.restrictTo = function(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperror(" you don't have permission perform this action", 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAysnc(async (req, res, next) => {
  //post token
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror("there is no user with this emal address", 404));
  }
  //generate  reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // const message = `Forget your password ? submit PATCH request for that and password confirm ${resetUrl}.\n If you didn't forget your password thne please ignore this email`;
  try {
    //send email to user for reset password
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).passwordReset();
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });
    res.status(200).json({
      status: "success",
      message: "Token send to mail!",
    });
  } catch (err) {
    User.passwordResetToken = undefined;
    User.passwordResetExpires = undefined;
    await user.save({ ValidateBeoforeSave: false });
    return next(new Apperror("try again later", 500));
  }
});

exports.resetPassword = catchAysnc(async (req, res, next) => {
  // get a token fro reset password
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // if token is expire
  if (!user) {
    return next(new Apperror("Token is expire!"), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAysnc(async (req, res, next) => {
  // get current passsword
  const user = await User.findById(req.user.id).select("+password");

  // current password is not match
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new Apperror("Your password is incorrect", 401));
  }

  //update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
