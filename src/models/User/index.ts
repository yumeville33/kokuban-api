import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";
// import validator from "validator";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date | number;
  passwordResetToken: string;
  passwordResetExpires: Date | number;
  active: boolean;
  /* eslint-disable no-unused-vars */
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
  changedPasswordAfter: (JWTTimestamp: Date | number) => boolean;
  /* eslint-disable no-unused-vars */
}

const userSchema = new mongoose.Schema<IUser>({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    index: true,
  },
  photoUrl: String,
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator(value: string) {
        // @ts-ignore
        const thisPassword = this.password;
        return value === thisPassword;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// eslint-disable-next-line func-names, consistent-return
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// eslint-disable-next-line func-names, consistent-return
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to current query
  // @ts-ignore
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword: string,
  userPassword: string
) => {
  // eslint-disable-next-line no-return-await
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: Date | number
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }

  // False mean NOT Changed
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
