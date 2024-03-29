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
  uploadTransactions,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  recalculateStats,
  uploadAccounts,
  getTags,
  getTransaction,
} from "../controllers/expenses/index.js";
import { uploadFile } from "../controllers/utils.js";

const router = express.Router();

router.post("/upload", auth, uploadFile);

router.get("/accounts", auth, getAccounts);
router.post("/accounts", auth, addAccount);
router.patch("/accounts/:id", auth, updateAccount);
router.delete("/accounts/:id", auth, deleteAccount);
router.post("/uploadAccounts", auth, uploadAccounts);

router.get("/transactions", auth, getTransactions);
router.get("/transactions/:id", auth, getTransaction);
router.post("/transactions", auth, addTransaction);
router.patch("/transactions/:id", auth, updateTransaction);
router.delete("/transactions/:id", auth, deleteTransaction);
router.post("/uploadTransactions", auth, uploadTransactions);

router.get("/tags", auth, getTags);

router.get("/userStats", auth, getUserStats);
router.get("/typeStats", auth, getTypeStats);
router.get("/tagStats", auth, getTagStats);
router.post("/recalculateStats", auth, recalculateStats);

export default router;
