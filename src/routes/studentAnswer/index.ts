import express from "express";

import {
  createStudentAnswer,
  getAllStudentAnswersOnBoard,
  getAllStudentAnswersOnBoardTable,
  getOneStudentAnswersOnBoard,
  setStudentAnswerImageToNull,
  updateStudentGrade,
} from "../../controllers/studentAnswer";

const router = express.Router();

router.post("/answer/:boardId", createStudentAnswer);

router.get("/answer-board/:boardId", getAllStudentAnswersOnBoard);

router.get("/answer-board/table/:boardId", getAllStudentAnswersOnBoardTable);

router.get("/answer-board-one/:answerId", getOneStudentAnswersOnBoard);

router.patch("/answer-student/:answerId", updateStudentGrade);

router.patch("/answer-delete/:answerId", setStudentAnswerImageToNull);

export default router;
