import express from "express";

import {
  createStudentAnswer,
  getAllStudentAnswersOnBoard,
  getOneStudentAnswersOnBoard,
  updateStudentGrade,
} from "../../controllers/studentAnswer";

const router = express.Router();

router.post("/answer/:boardId", createStudentAnswer);

router.get("/answer-board/:boardId", getAllStudentAnswersOnBoard);

router.get("/answer-board-one/:answerId", getOneStudentAnswersOnBoard);

router.patch("/answer-student/:answerId", updateStudentGrade);

export default router;
