import { NextFunction, Response, RequestHandler, Request } from "express";

import { AppError } from "../../utils/responses/error";
import { StudentAnswer } from "../../models";

export const createStudentAnswer: RequestHandler =
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boardId } = req.params;

      const studentAnswer = await StudentAnswer.create({
        ...req.body,
        boardRef: boardId,
        grade: 0,
      });

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
