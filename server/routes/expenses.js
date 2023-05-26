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
  processUpload,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/expenses/index.js";
import { uploadFile } from "../controllers/utils.js";

const router = express.Router();

router.post("/upload", auth, uploadFile);
router.post("/processUpload", auth, processUpload);

router.get("/accounts", auth, getAccounts);
router.post("/accounts", auth, addAccount);
router.patch("/accounts/:id", auth, updateAccount);
router.delete("/accounts/:id", auth, deleteAccount);

router.get("/transactions", auth, getTransactions);
router.post("/transactions", auth, addTransaction);
router.patch("/transactions/:id", auth, updateTransaction);
router.delete("/transactions/:id", auth, deleteTransaction);

router.get("/userStats", auth, getUserStats);
router.get("/typeStats", auth, getTypeStats);
router.get("/tagStats", auth, getTagStats);

export default router;
