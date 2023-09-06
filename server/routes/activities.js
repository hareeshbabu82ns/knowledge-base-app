import express from "express";

import auth from "../middlewares/auth.js";
import {
  addActivity,
  deleteActivity,
  getActivities,
  getActivity,
  updateActivity,
} from "../controllers/activities/index.js";

const router = express.Router();

router.get("/activities", auth, getActivities);
router.get("/:id", auth, getActivity);
router.post("/activities", auth, addActivity);
router.patch("/activities/:id", auth, updateActivity);
router.delete("/activities/:id", auth, deleteActivity);

export default router;
