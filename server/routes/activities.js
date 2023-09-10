import express from "express";

import auth from "../middlewares/auth.js";
import {
  addActivity,
  deleteActivity,
  deleteActivityTrack,
  getActivities,
  getActivity,
  getActivityTracks,
  updateActivity,
  updateActivityTrack,
} from "../controllers/activities/index.js";

const router = express.Router();

router.get("/activities", auth, getActivities);
router.get("/:id", auth, getActivity);
router.get("/:id/tracks", auth, getActivityTracks);
router.delete("/:activityId/tracks/:id", auth, deleteActivityTrack);
router.post("/activities", auth, addActivity);
router.patch("/activities/:id", auth, updateActivity);
router.patch("/:activityId/tracks/:id", auth, updateActivityTrack);
router.delete("/activities/:id", auth, deleteActivity);

export default router;
