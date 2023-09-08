import mongoose from "mongoose";
import { DateTime } from "luxon";

import Activity from "../../models/Activities/Activity.js";
import ActivityTrack from "../../models/Activities/ActivityTrack.js";

const validateActivity = ({ description, isExclusive, isRunning }) => {
  if (description.length === 0) {
    throw new Error("description can not be empty");
  }

  return true;
};

const addActivityRecord = async (
  { description, isExclusive, isRunning },
  user
) => {
  const isValid = validateActivity({
    description,
    isExclusive,
    isRunning,
  });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // create Activity entry
    const newActivity = new Activity({
      userId: user._id,
      description,
      isExclusive,
      isRunning,
    });
    const activity = await newActivity.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { data: activity, error: undefined };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return { data: undefined, error: err.message };
  }
};

export const addActivity = async (req, res) => {
  try {
    const { user } = req.auth;

    const { description, isExclusive, isRunning } = req.body;

    const { data, error } = await addActivityRecord(
      {
        description,
        isExclusive,
        isRunning,
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

export const deleteActivity = async (req, res) => {
  try {
    const { user } = req.auth;

    const { id } = req.params;

    // fetch existing Activity
    const oldActivity = await Activity.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldActivity )

    if (!oldActivity) throw new Error(`No Activity found with id ${id}`);

    if (oldActivity.userId !== user.id)
      throw new Error(`Activity is not from same user`);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // delete Activity entry
      const activity = await oldActivity.deleteOne({ session });

      // delete related tracks

      //TODO: delete related stats

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ id: oldActivity._id });
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

export const updateActivity = async (req, res) => {
  try {
    const { user } = req.auth;

    const { description, isExclusive, isRunning, clientDate } = req.body;

    const { id } = req.params;

    // fetch existing transaction
    const oldActivity = await Activity.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldActivity )

    if (!oldActivity) throw new Error(`No Activity found with id ${id}`);

    if (oldActivity.userId !== user.id)
      throw new Error(`Activity is not from same user`);

    const newActivity = {
      description,
      isExclusive,
      isRunning: isRunning === undefined ? oldActivity.isRunning : isRunning,
    };

    await updateActivityRecord(
      {
        ...oldActivity.toObject(),
        _id: oldActivity._id,
        clientDate,
      },
      newActivity,
      user
    );

    res.status(200).json({ id: oldActivity._id });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

const updateActivityRecord = async (oldActivity, newActivity, user) => {
  const {
    _id,
    description: descriptionOld,
    isExclusive: isExclusiveOld,
    isRunning: isRunningOld,
    startedAt,
    clientDate,
  } = oldActivity;

  const {
    description,
    isExclusive = isExclusiveOld,
    isRunning = isRunningOld,
  } = newActivity;

  if (isRunning) {
    //starting, update last started at date into activity
    newActivity["startedAt"] = clientDate;
  }

  // const isValid = validateActivity({
  //   description,
  //   isExclusive,
  // });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // update Activity entry
    // console.log(newActivity);
    const activity = await Activity.updateOne({ _id }, newActivity, {
      session,
    });

    if (isRunning !== isRunningOld) {
      // update run state of other activities
      await updateActivityRunState(
        {
          _id,
          isExclusive,
          isRunning,
          clientDate,
        },
        user,
        session
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { data: activity, error: undefined };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return { data: undefined, error: err.message };
  }
};

const updateActivityRunState = async (
  { _id, isExclusive, isRunning, clientDate },
  user,
  session
) => {
  const track = await updateActivityTrackRunState(
    { activityId: _id, userId: user._id, isRunning, clientDate },
    session
  );
  if (!isRunning) return; //stopping, no further action needed
  if (!isExclusive) return; // no need to update others
  // console.log(isExclusive, isRunning);
  // this is exclusive activity.. stop all other running activites
  // 1. fetch all running activities
  const runningActivities = await Activity.find({
    userId: user._id,
    isRunning: true,
  });
  // 2. stop running activities
  for (const runningActivity of runningActivities) {
    if (runningActivity._id.equals(_id)) break;
    // console.log(runningActivity, id);
    runningActivity.isRunning = false;
    await runningActivity.save({ session });
    await updateActivityTrackRunState(
      {
        activityId: runningActivity._id,
        userId: user._id,
        isRunning: false,
        clientDate,
      },
      session
    );
  }
};

const updateActivityTrackRunState = async (
  { activityId, userId, isRunning, clientDate },
  session
) => {
  if (!isRunning) {
    // stopping the activity

    // find and add end date
    const track = await ActivityTrack.findOne({
      activityId,
      userId,
      dateEnd: "",
    });
    // console.log("stopping track:", track._id);
    if (track) {
      track.dateEnd = clientDate;
      // calculate diff
      const dateStart = DateTime.fromFormat(track.dateStart, "yyyyMMddHHmmss");
      const dateEnd = DateTime.fromFormat(track.dateEnd, "yyyyMMddHHmmss");
      track.runtime = dateEnd.diff(dateStart, "seconds").seconds;
      // console.log(track.runtime);
      await track.save(session);
    }

    // find all tracks of the activity and update total runtime
    const tracks = await ActivityTrack.find({
      activityId,
      userId,
    });
    const runtime = tracks.reduce(
      (runtime, track) => runtime + track.runtime,
      0
    );
    // console.log("activity total runtime:", runtime);
    await Activity.findByIdAndUpdate(activityId, { runtime }, { session });

    return track;
  } else {
    // starting the activity
    const tracks = await ActivityTrack.create(
      [{ activityId, userId, dateStart: clientDate, dateEnd: "" }],
      {
        session,
      }
    );
    // console.log("starting new track:", tracks[0]._id);
    return tracks[0];
  }
};

export const getActivity = async (req, res) => {
  try {
    const { user } = req.auth;
    const { id } = req.params;

    const data = await Activity.findOne({
      userId: user._id,
      _id: id,
    });
    res.status(200).json({ ...data.toJSON() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getActivities = async (req, res) => {
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

    if (!sortFormatted.isRunning) sortFormatted.isRunning = -1;

    const data = await Activity.find({
      userId: user._id,
      $or: [{ description: { $regex: new RegExp(search, "i") } }],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Activity.countDocuments({
      userId: user._id,
      $or: [{ description: { $regex: new RegExp(search, "i") } }],
    });

    res.status(200).json({ data, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
