import { NextFunction, Response, RequestHandler, Request } from "express";
import randomstring from "randomstring";

import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
import { Content, IContent, User } from "../../models";
import { base64ToBuffer, bufferToBase64 } from "../../utils/imageBuffer";

export const saveContent: RequestHandler<any, IContent> = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { contentId } = req.body;

    console.log("userId", userId);

    // const user = await User.findOne({ email: userEmail });
    const user = await User.findById(userId);

    console.log("user", user);

    if (!user) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    const { thumbnail, content } = req.body;
    const newContent = content.map((item: any) => {
      const newItem = { ...item };

      if (newItem.toolType === "image") {
        return {
          ...newItem,
          image: {
            uri: base64ToBuffer(newItem.image.uri),
            extensionType: newItem.image.extensionType,
          },
        };
      }
      return newItem;
    });

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

    const data = { ...req.body };
    data.content = newContent;
    delete data.contentId;

    const newData: IContent = data;
    newData.thumbnail.uri = base64ToBuffer(thumbnail.uri);
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
    const data = await Content.find({ user: userId }).sort({ updatedAt: -1 });
    // const newData = data[0];
    // console.log("image", bufferToBase64(data[0].thumbnail.uri));

    const newData: any = data.map((d) => {
      return {
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        thumbnail: {
          uri: bufferToBase64(d.thumbnail.uri, d.thumbnail.extensionType),
          extensionType: d.thumbnail.extensionType,
        },
        content: d.content.map((item: any) => {
          if (item.toolType === "image") {
            return {
              ...item,
              image: {
                uri: bufferToBase64(item.image.uri, item.image.extensionType),
                extensionType: item.image.extensionType,
              },
            };
          }
          return item;
        }),
        code: d.code,
        user: d.user,
        _id: d._id,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        data: newData,
      },
    });
  }
);

export const getOneUserContent = catchAsync(
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    const { contentId } = req.params;

    // if (!userId || !contentId) {
    //   return next(
    //     new AppError(
    //       "BadRequestException",
    //       "Something wen't wrong! Please try again later."
    //     )
    //   );
    // }

    // const user = await User.findById(userId);
    // if (!user) {
    //   return next(
    //     new AppError(
    //       "BadRequestException",
    //       "Something wen't wrong! Please try again later."
    //     )
    //   );
    // }
    const data = await Content.findById(contentId);
    if (!data) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }
    const newData: any = {
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      thumbnail: {
        uri: bufferToBase64(data.thumbnail.uri, data.thumbnail.extensionType),
        extensionType: data.thumbnail.extensionType,
      },
      content: data.content.map((item: any) => {
        if (item.toolType === "image") {
          return {
            id: item.id,
            toolType: item.toolType,
            size: item.size,
            originalSize: item.originalSize,
            image: {
              uri: bufferToBase64(item.image.uri, item.image.extensionType),
              extensionType: item.image.extensionType,
            },
            position: item.position,
            // eslint-disable-next-line no-underscore-dangle
            _id: item._id,
          };
        }
        return item;
      }),
      code: data.code,
      user: data.user,
      _id: data._id,
    };

    res.status(200).json({
      status: "success",
      data: {
        data: newData,
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
