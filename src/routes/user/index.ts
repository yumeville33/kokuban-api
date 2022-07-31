import express from "express";

import { signup, login, protect } from "../../controllers/auth";
import { getMe, updateMe, deleteMe } from "../../controllers/user";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Protect all routes after this middleware
router.use(protect);

// router.patch("/updateMyPassword", updatePassword);

router.get("/me", getMe);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

export default router;
