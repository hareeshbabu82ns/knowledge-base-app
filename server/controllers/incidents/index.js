import mongoose from "mongoose";

import Incident from "../../models/Incidents/Incident.js";
import IncidentTag from "../../models/Incidents/IncidentTag.js";

const validateIncident = ({ description }) => {
  if (description.length === 0) {
    throw new Error("description can not be empty");
  }

  return true;
};

const addIncidentRecord = async ({ description, tags }, user) => {
  const isValid = validateIncident({
    description,
    tags,
  });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // create Incident entry
    const newIncident = new Incident({
      userId: user._id,
      description,
      tags,
    });
    const incident = await newIncident.save({ session });

    // save tag entries
    for (const tag of tags) {
      const existingTag = await IncidentTag.findOne({ userId: user._id, tag });
      if (!existingTag) {
        // tag not available - create new
        const exTag = new IncidentTag({ userId: user._id, tag }, { session });
        await exTag.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return { data: incident, error: undefined };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return { data: undefined, error: err.message };
  }
};

export const addIncident = async (req, res) => {
  try {
    const { user } = req.auth;

    const { description, tags } = req.body;

    const { data, error } = await addIncidentRecord(
      {
        description,
        tags,
      },
      user
    );

    if (error) {
      res.status(404).json({ message: error });
    } else {
      res.status(201).json({ id: data._id });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const { user } = req.auth;

    const { id } = req.params;

    // fetch existing Incident
    const oldIncident = await Incident.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldIncident )

    if (!oldIncident) throw new Error(`No Incident found with id ${id}`);

    if (oldIncident.userId !== user.id)
      throw new Error(`Incident is not from same user`);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // delete Incident entry
      const incident = await oldIncident.deleteOne({ session });

      // delete related tracks

      //TODO: delete related stats

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ id: oldIncident._id });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: err.message });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { user } = req.auth;

    const { description, tags } = req.body;

    const { id } = req.params;

    // fetch existing transaction
    const oldIncident = await Incident.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldIncident )

    if (!oldIncident) throw new Error(`No Incident found with id ${id}`);

    if (oldIncident.userId !== user.id)
      throw new Error(`Incident is not from same user`);

    const newIncident = {
      description,
      tags,
    };

    await updateIncidentRecord(
      {
        ...oldIncident.toObject(),
        _id: oldIncident._id,
      },
      newIncident,
      user
    );

    res.status(200).json({ id: oldIncident._id });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

const updateIncidentRecord = async (oldIncident, newIncident, user) => {
  const { _id, description: descriptionOld } = oldIncident;

  const { description, tags } = newIncident;

  // const isValid = validateIncident({
  //   description,
  //   isExclusive,
  // });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // update Incident entry
    // console.log(newIncident);
    const incident = await Incident.updateOne({ _id }, newIncident, {
      session,
    });

    // save tag entries
    for (const tag of tags) {
      const existingTag = await IncidentTag.findOne({ userId: user._id, tag });
      if (!existingTag) {
        // tag not available - create new
        const exTag = new IncidentTag({ userId: user._id, tag }, { session });
        await exTag.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return { data: incident, error: undefined };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return { data: undefined, error: err.message };
  }
};

export const getIncident = async (req, res) => {
  try {
    const { user } = req.auth;
    const { id } = req.params;

    const data = await Incident.findOne({
      userId: user._id,
      _id: id,
    });
    res.status(200).json({ ...data.toJSON() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const { user } = req.auth;

    // sort should look like : { "field": "userId", "sort": "desc" }
    const { page = 0, pageSize = 20, sort = null, search = "" } = req.query;

    // formatted sort should look like: {userId: -1}
    const genSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
      };
      return sortFormatted;
    };

    const sortFormatted = Boolean(sort) ? genSort() : {};

    if (!sortFormatted.description) sortFormatted.description = 1;

    const data = await Incident.find({
      userId: user._id,
      $or: [
        { tags: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Incident.countDocuments({
      userId: user._id,
      $or: [
        { tags: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ],
    });

    res.status(200).json({ data, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Tags
export const getTags = async (req, res) => {
  try {
    const { user } = req.auth;

    // sort should look like : { "field": "userId", "sort": "desc" }
    const { search = "" } = req.query;

    const tags = await IncidentTag.find({
      userId: user._id,
      $or: [{ tag: { $regex: new RegExp(search, "i") } }],
    }).sort({ tag: 1 });

    const total = await IncidentTag.countDocuments({
      userId: user._id,
      $or: [{ tag: { $regex: new RegExp(search, "i") } }],
    });

    const tagsSet = new Set(tags.map((v) => v.get("tag")));

    res.status(200).json({ tags: [...tagsSet], total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
