const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// useschema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'A user  must have a name'],
    maxLength: [10, 'A user must have 10 characters long name'],
    minlength: [4, 'A user must have minimum 4 characters name']
  },
  email: {
    type: String,
    required: [true, 'A user must have email'],
    unique: true,
    lower: true,
    validate: [validator.isEmail, 'please provide us email']
  },
  password: {
    type: String,
    unique: true,
    required: [true, 'A user must need password for login'],
    maxLength: [12, 'user have maximum 12 letters  long passowrd'],
    minlength: [7, 'user must have minimum have 6 letters long password '],
    select: true
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // this works on create and save
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not same!'
    }
  },
  passwordChangeAt: Date,
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.pre('save', async function(next) {
  // it it only work when password is modified
  if (!this.isModified('password')) return next();

  // adding hash i npassword
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirem password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePassword = function(JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changeTimeStamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
