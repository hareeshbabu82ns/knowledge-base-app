import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isExclusive: {
      // can only run exclusively (all others will be stopped)
      type: Boolean,
      default: true,
    },
    isRunning: {
      // can only run exclusively (all others will be stopped)
      type: Boolean,
      default: false,
    },
    runtime: {
      type: Number,
      default: 0,
    },
    startedAt: {
      // date as yyyymmddhhmmss
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "activities",
  }
);

const Activity = mongoose.model("Activity", ActivitySchema);

export default Activity;
