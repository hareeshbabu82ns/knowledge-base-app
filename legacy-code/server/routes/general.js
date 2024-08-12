import express from "express";
import { getUser, getDashboardStats } from "../controllers/general.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/user/:id", auth, getUser);
router.get("/dashboard", getDashboardStats);

export default router;
