import { NextFunction, Response, RequestHandler, Request } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
import { Content, IContent, User } from "../../models";

export const base64ToBuffer = (base64: string) => {
  const split = base64.split(",");
  const base64string = split[1];
  const buffer = Buffer.from(base64string, "base64");

  return buffer;
};

// make a function that converts buffer image from mongodb to base64
const bufferToBase64 = (buffer: Buffer, type: string) => {
  const base64 = buffer.toString("base64");
  const newBase64 = `data:${type};base64,${base64}`;
  return newBase64;
};

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
      if (item.toolType === "image") {
        return {
          ...item,
          image: {
            uri: base64ToBuffer(item.image.uri),
            extensionType: item.image.extensionType,
          },
        };
      }
      return item;
    });

    const data = { ...req.body };
    data.content = newContent;
    delete data.contentId;

    const newData: IContent = data;
    newData.thumbnail.uri = base64ToBuffer(thumbnail.uri);

    if (req.method === "POST") {
      const date = new Date();
      newData.createdAt = date;
      newData.updatedAt = date;
      // eslint-disable-next-line no-underscore-dangle
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
        user: d.user,
        // eslint-disable-next-line no-underscore-dangle
        _id: d._id,
      };
    });

    // console.log("newData", newData);

    // res.status(200).json(newData);

    res.status(200).json({
      status: "success",
      data: {
        data: newData,
      },
    });
  }
);
