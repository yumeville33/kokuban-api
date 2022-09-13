import { NextFunction, Response, RequestHandler, Request } from "express";
// import randomstring from "randomstring";

// import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/responses/error";
// import { IStudentAnswer, StudentAnswer } from "../../models";
import { StudentAnswer } from "../../models";
import { base64ToBuffer, bufferToBase64 } from "../../utils/imageBuffer";

export const createStudentAnswer: RequestHandler =
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boardId } = req.params;

      const {
        content,
        image,
        boardOwner,
        studentName,
        schoolName,
        studentSection,
      } = req.body;

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
        grade: 0,
        studentName,
        schoolName,
        studentSection,
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
  const { boardId } = req.params;

  try {
    const studentAnswers = await StudentAnswer.find({
      boardRef: boardId,
      image: { $ne: null },
    }).sort({ updatedAt: -1 });

    const newStudentAnswers: any = studentAnswers.map((item) => {
      const newItem = {
        _id: item._id,
        boardOwner: item.boardOwner,
        boardRef: item.boardRef,
        content: item.content.map((c: any) => {
          if (c.toolType === "image") {
            return {
              ...c,
              image: {
                uri: bufferToBase64(c.image.uri, c.image.extensionType),
                extensionType: c.image.extensionType,
              },
            };
          }
          return c;
        }),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        grade: item.grade,
        schoolName: item.schoolName,
        studentName: item.studentName,
        studentSection: item.studentSection,
        image: {
          uri: bufferToBase64(item.image!.uri, item.image!.extensionType),
          extensionType: item.image!.extensionType,
        },
      };

      return newItem;
    });

    return res.status(200).json({
      status: "success",
      data: {
        studentAnswers: newStudentAnswers,
      },
    });
  } catch (error: any) {
    return next(new AppError("BadRequestException", error.message));
  }
};

export const getAllStudentAnswersOnBoardTable: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { boardId } = req.params;

  try {
    const studentAnswers = await StudentAnswer.find({
      boardRef: boardId,
    }).sort({ updatedAt: -1 });

    const newStudentAnswers: any = studentAnswers.map((item) => {
      const newItem = {
        _id: item._id,
        boardOwner: item.boardOwner,
        boardRef: item.boardRef,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        grade: item.grade,
        schoolName: item.schoolName,
        studentName: item.studentName,
        studentSection: item.studentSection,
      };

      return newItem;
    });

    return res.status(200).json({
      status: "success",
      data: {
        studentAnswers: newStudentAnswers,
      },
    });
  } catch (error: any) {
    return next(new AppError("BadRequestException", error.message));
  }
};

export const getOneStudentAnswersOnBoard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { answerId } = req.params;

  try {
    const data = await StudentAnswer.findById(answerId);

    if (!data) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    const newData: any = {
      image: {
        uri: bufferToBase64(data.image!.uri, data.image!.extensionType),
        extensionType: data.image!.extensionType,
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      grade: data.grade,
      schoolName: data.schoolName,
      studentName: data.studentName,
      studentSection: data.studentSection,
      _id: data._id,
      boardOwner: data.boardOwner,
      boardRef: data.boardRef,
    };

    return res.status(200).json({
      status: "success",
      data: {
        studentAnswer: newData,
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

export const updateStudentGrade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { answerId } = req.params;
  try {
    const data = await StudentAnswer.findByIdAndUpdate(
      answerId,
      { grade: req.body.grade },
      { new: true }
    );

    if (!data) {
      return next(
        new AppError(
          "BadRequestException",
          "Something wen't wrong! Please try again later."
        )
      );
    }

    return res.status(200).json({
      status: "success",
      data: {
        studentAnswer: data,
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

export const setStudentAnswerImageToNull = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await StudentAnswer.findByIdAndUpdate(
      req.params.answerId,
      { image: null },
      { new: true }
    );

    if (!data) {
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
