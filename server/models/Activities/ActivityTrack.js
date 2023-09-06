import mongoose from "mongoose";

const ActivityTrackSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    activityId: {
      type: String,
      required: true,
    },
    dateStart: {
      // date as yyyymmddhhmmss
      type: String,
      required: true,
    },
    dateEnd: {
      // date as yyyymmddhhmmss
      type: String,
    },
  },
  {
    collection: "activity_tracks",
  }
);

const ActivityTrack = mongoose.model("ActivityTrack", ActivityTrackSchema);

export default ActivityTrack;
