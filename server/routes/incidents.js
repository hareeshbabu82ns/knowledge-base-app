import express from "express";

import auth from "../middlewares/auth.js";
import {
  addIncident,
  deleteIncident,
  getIncidents,
  getIncident,
  updateIncident,
  getTags,
} from "../controllers/incidents/index.js";

const router = express.Router();

router.get("/incidents", auth, getIncidents);
router.get("/incidents/tags", auth, getTags);
router.get("/incidents/:id", auth, getIncident);
router.post("/incidents", auth, addIncident);
router.patch("/incidents/:id", auth, updateIncident);
router.delete("/incidents/:id", auth, deleteIncident);

export default router;
