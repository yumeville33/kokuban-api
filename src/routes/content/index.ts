import express from "express";

import { saveContent, getUserContents } from "../../controllers/content";

const router = express.Router();

// router.post("/:userId/save", saveContent).patch();

router.route("/:userId/save").post(saveContent).patch(saveContent);
router.get("/:userId/getUserContent", getUserContents);

export default router;
