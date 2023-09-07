import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      of: Number,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "incidents",
  }
);

const Incident = mongoose.model("Incident", IncidentSchema);

export default Incident;
