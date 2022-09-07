import express from "express";

import {
  saveContent,
  getUserContents,
  getOneUserContent,
  getUserContentByCode,
} from "../../controllers/content";

const router = express.Router();

// router.post("/:userId/save", saveContent).patch();

router.route("/:userId/save").post(saveContent).patch(saveContent);
router.get("/:userId/getUserContent", getUserContents);
router.get("/getOneUserContent/:contentId", getOneUserContent);
router.get("/:contentCode/getOneContent", getUserContentByCode);

export default router;
