import express from "express";
import {
  getAllUsers,
  getCurrentUserController,
  updateUserController,
} from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.route("/").get(protect, getAllUsers);

router.route("/current-user").get(protect, getCurrentUserController);

router.route("/update-user").put(protect, updateUserController);

export default router;