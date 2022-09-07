import { NextFunction, Response, RequestHandler, Request } from "express";
// import randomstring from "randomstring";

// import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
// import { IStudentAnswer, StudentAnswer } from "../../models";
import { StudentAnswer } from "../../models";
import { base64ToBuffer } from "../../utils/imageBuffer";

export const createStudentAnswer: RequestHandler =
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boardId } = req.params;

      const { content, image, boardOwner, grade, studentName } = req.body;

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

      const studentAnswerInfo = {
        content: newContent,
        image: {
          uri: base64ToBuffer(image.uri),
          extensionType: image.extensionType,
        },
        boardRef: boardId,
        boardOwner,
        grade,
        studentName,
        timeSubmitted: new Date(),
      };

      const studentAnswer = await StudentAnswer.create(studentAnswerInfo);

      res.status(201).json({
        status: "success",
        data: {
          studentAnswer,
        },
      });
    } catch (error: any) {
      return next(new AppError("BadRequestException", error.message));
    }
  };

export const getAllStudentAnswersOnBoard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentAnswers = await StudentAnswer.find({
      boardRef: req.params.boardId,
    });

    return res.status(200).json({
      status: "success",
      data: {
        studentAnswers,
      },
    });
  } catch (error: any) {
    return next(new AppError("BadRequestException", error.message));
  }
};
