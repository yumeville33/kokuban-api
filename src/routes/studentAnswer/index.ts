import express from "express";

import { createStudentAnswer } from "../../controllers/studentAnswer";

const router = express.Router();

router.post("/answer/:boardId", createStudentAnswer);

export default router;
