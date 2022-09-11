import express from "express";

import {
  saveContent,
  getUserContents,
  getOneUserContent,
  getUserContentByCode,
  getOtherUsersContents,
} from "../../controllers/content";

const router = express.Router();

// router.post("/:userId/save", saveContent).patch();

router.route("/:userId/save").post(saveContent).patch(saveContent);
router.get("/:userId/getUserContent", getUserContents);
router.get("/getOneUserContent/:contentId", getOneUserContent);
router.get("/:contentCode/getOneContent", getUserContentByCode);
router.get("/otherContents/:userId", getOtherUsersContents);

export default router;
