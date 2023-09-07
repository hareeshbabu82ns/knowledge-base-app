import mongoose from "mongoose";

const IncidentTagSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    collection: "incident_tags",
  }
);

const IncidentTag = mongoose.model("IncidentTag", IncidentTagSchema);

export default IncidentTag;
