import mongoose from "mongoose";

const ActivityStatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    activityId: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    yearlyTotal: Number,
    monthlyData: [
      {
        month: Number,
        total: Number,
      },
    ],
    dailyData: [
      {
        month: Number,
        date: Number,
        total: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: "activity_stats",
  }
);

const ActivityStat = mongoose.model("ActivityStat", ActivityStatSchema);

export default ActivityStat;
