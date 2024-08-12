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
      default: "",
    },
    runtime: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "activity_tracks",
  }
);

// ActivityTrackSchema.pre("save", (next, doc) => {
//   console.log("pre start", this?.dateStart, doc, next);
//   if (doc.dateEnd.length > 0) {
//     // calculate diff
//     const dateStart = DateTime.fromFormat(doc.dateStart, "yyyyMMddHHmmss");
//     const dateEnd = DateTime.fromFormat(doc.dateEnd, "yyyyMMddHHmmss");
//     console.log(dateEnd);
//     doc.runtime = dateEnd.diff(dateStart, "seconds").seconds;
//   }
//   console.log("pre end", doc);
//   next();
// });

const ActivityTrack = mongoose.model("ActivityTrack", ActivityTrackSchema);

export default ActivityTrack;
