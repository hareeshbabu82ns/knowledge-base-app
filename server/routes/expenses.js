import express from "express";

import auth from "../middlewares/auth.js";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getUserStats,
  getTypeStats,
  getTagStats,
} from "../controllers/expenses/index.js";

const router = express.Router();

router.get("/transactions", auth, getTransactions);
router.post("/transactions", auth, addTransaction);
router.patch("/transactions/:id", auth, updateTransaction);
router.delete("/transactions/:id", auth, deleteTransaction);

router.get("/userStats", auth, getUserStats);
router.get("/typeStats", auth, getTypeStats);
router.get("/tagStats", auth, getTagStats);

export default router;
