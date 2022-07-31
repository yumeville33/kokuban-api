import { NextFunction, Request, Response } from "express";

import { User, IUser } from "../../models";
import { AppError } from "../../utils/responses/error";
import { catchAsync } from "../../utils/catchAsync";

const filterObj = (obj: any, ...allowedFields: Array<any>) => {
  const newObject: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });

  return newObject;
};

export interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}

export const getMe = catchAsync(
  (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    req.params.id = req.user.id;
    next();
  }
);

// export const getMe = (
//   req: IGetUserAuthInfoRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   req.params.id = req.user.id;
//   next();
// };

export const updateMe = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "BadRequestException",
          "This route is not for updating password. Please use updateMyPassword"
        )
      );
    }

    // 2) Filtered out field names which are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  }
);

export const deleteMe = catchAsync(
  // eslint-disable-next-line no-unused-vars
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Please use /signup route instead.",
  });
};
