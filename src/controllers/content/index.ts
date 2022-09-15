import { NextFunction, Response, RequestHandler, Request } from "express";
import randomstring from "randomstring";

import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
import { Content, IContent, User } from "../../models";

export const saveContent: RequestHandler<any, IContent> = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { contentId } = req.body;

    // const user = await User.findOne({ email: userEmail });
    const user = await User.findById(userId);

    if (!user) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    let isCodeUnique = false;
    let uniqueCode = "";

    while (!isCodeUnique) {
      const code = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });

      // eslint-disable-next-line no-await-in-loop
      const _content = await Content.findOne({ code });

      if (!_content) {
        isCodeUnique = true;
        uniqueCode = code;
      }
    }

    const data = { ...req.body, title: req.body.title.trim() || "Unknown" };
    delete data.contentId;

    const newData: IContent = data;
    newData.code = uniqueCode;

    if (req.method === "POST") {
      const date = new Date();
      newData.createdAt = date;
      newData.updatedAt = date;
      newData.user = user._id;

      const postData = await Content.create(newData);
      res.status(200).json({
        status: "success",
        data: {
          data: postData,
        },
      });
    }

    if (req.method === "PATCH") {
      newData.updatedAt = new Date();

      const currentData = await Content.findByIdAndUpdate(contentId, newData, {
        new: true,
      });

      res.status(200).json({
        status: "success",
        data: {
          data: currentData,
        },
      });
    }
  }
);

export const getUserContents = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }
    const data = await Content.find({
      user: userId,
      thumbnail: { $ne: null },
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  }
);

export const getOneUserContent = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { contentId } = req.params;

    const data = await Content.findById(contentId);
    if (!data) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  }
);

export const getUserContentByCode = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { contentCode } = req.params;

    if (!contentCode) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    const data = await Content.findOne({ code: contentCode });

    if (!data) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  }
);

export const getOtherUsersContents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    // find contents where _id is not equal to userId
    const otherUserContents = await Content.find({
      user: { $ne: userId },
      thumbnail: { $ne: null },
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      status: "success",
      data: {
        data: otherUserContents,
      },
    });
  } catch (error) {
    return next(
      new AppError(
        "BadRequestException",
        "Something wen't wrong! Please try again later."
      )
    );
  }
};

export const setThumbnailToNull = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findByIdAndUpdate(
      contentId,
      {
        thumbnail: null,
      },
      { new: true }
    );

    if (!content) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    return next(
      new AppError(
        "BadRequestException",
        "Something wen't wrong! Please try again later."
      )
    );
  }
};
