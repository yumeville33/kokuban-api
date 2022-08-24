import { NextFunction, Response, RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";

import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
import { User, IUser } from "../../models";

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  });
};

export const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  // eslint-disable-next-line no-underscore-dangle
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      // eslint-disable-next-line no-underscore-dangle
      Date.now() +
        parseInt(process.env.JWT_EXPIRES_IN as string, 10) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  // eslint-disable-next-line no-param-reassign
  user.password = "";

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup: RequestHandler<any, IUser> = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    //  Check if email is already taken
    const user = await User.findOne({ email });
    if (user) {
      return next(
        new AppError("BadRequestException", "Email is already taken")
      );
    }

    if (password !== passwordConfirm) {
      return next(
        new AppError("BadRequestException", "Passwords do not match")
      );
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
    });

    createSendToken(newUser, 201, res);
  }
);

export const login: RequestHandler<any, IUser> = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError("BadRequestException", "Please provide email and password")
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError("UnauthorizedException", "Incorrect email or password")
      );
    }

    createSendToken(user, 200, res);
  }
);

export interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}

export const protect: RequestHandler<any, IUser> = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // eslint-disable-next-line prefer-destructuring
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "UnauthorizedException",
          "You are not logged in! Please login to get access."
        )
      );
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError("UnauthorizedException", "User does not exist"));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("UnauthorizedException", "User recently changed password")
      );
    }

    req.user = currentUser;
    next();
  }
);
