import mongoose from "mongoose";

import { EXPENSE_TYPES } from "../../models/Expenses/const.js";

import Transaction from "../../models/Expenses/ExpenseTransaction.js";
import { getClientDateTime, prepareTransaction } from "./logic.js";
import ExpenseTag from "../../models/Expenses/ExpenseTag.js";
import ExpenseTagStat from "../../models/Expenses/ExpenseTagStat.js";
import ExpenseTypeStat from "../../models/Expenses/ExpenseTypeStat.js";

const validateTransactionData = ({ amount, tags, type }) => {
  if (amount === 0) {
    throw new Error("amount can not be empty");
  }

  if (tags.length === 0) {
    throw new Error("tags can not be empty");
  }

  if (!EXPENSE_TYPES.includes(type)) {
    throw new Error("expense type not valid");
  }

  return true;
};

export const deleteTransaction = async (req, res) => {
  try {
    const { user } = req.auth;

    const { id } = req.params;

    // fetch existing transaction
    const oldTransaction = await Transaction.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldTransaction )

    if (!oldTransaction) throw new Error(`No Transaction found with id ${id}`);

    if (oldTransaction.userId !== user.id)
      throw new Error(`Transaction is not from same user`);

    const trans = await oldTransaction.deleteOne();

    // console.log( 'date utc: ', dateUTC )
    // console.log( 'date db: ', trans.date )
    // console.log( trans )

    res.status(200).json({ id: oldTransaction._id });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { user } = req.auth;

    const { amount, tags, type, dateUTC } = req.body;

    const { id } = req.params;

    // fetch existing transaction
    const oldTransaction = await Transaction.findById(
      new mongoose.Types.ObjectId(id)
    );
    // console.log( oldTransaction )

    if (!oldTransaction) throw new Error(`No Transaction found with id ${id}`);

    if (oldTransaction.userId !== user.id)
      throw new Error(`Transaction is not from same user`);

    const isValid = validateTransactionData({
      amount,
      tags,
      type,
      date: dateUTC,
    });

    oldTransaction.set({ userId: user._id, amount, tags, type, date: dateUTC });

    const trans = await oldTransaction.save();

    // console.log( 'date utc: ', dateUTC )
    // console.log( 'date db: ', trans.date )
    // console.log( trans )

    res.status(200).json({ id: oldTransaction._id });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { user } = req.auth;

    const { amount, tags, type, date } = req.body;

    const isValid = validateTransactionData({ amount, tags, type, date });

    const clientDate = getClientDateTime({ date });
    const transactionYear = clientDate.year;

    const tagStats = [];
    const tagStatsRef = {};

    for (const tag of tags) {
      const existingTagStats = await ExpenseTagStat.findOne({
        userId: user._id,
        tag,
        year: transactionYear,
      });
      if (existingTagStats) {
        tagStatsRef[existingTagStats._id] = existingTagStats;
        tagStats.push(existingTagStats.toObject());
      }
    }

    const typeStatsRef = await ExpenseTypeStat.findOne({
      userId: user._id,
      type,
      year: transactionYear,
    });

    const typeStats = typeStatsRef ? typeStatsRef.toObject() : undefined;

    const { transactionData, tagData, tagStatsData, typeStatsData } =
      prepareTransaction({
        transaction: { amount, tags, type, date },
        user,
        tagStats,
        typeStats,
      });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // create transaction entry
      const newTransaction = new Transaction(transactionData);
      const trans = await newTransaction.save({ session });

      // save tag entries
      for (const tag of tagData) {
        const existingTag = await ExpenseTag.findOne(tag);
        if (!existingTag) {
          // tag not available - create new
          const exTag = new ExpenseTag(tag, { session });
          await exTag.save({ session });
        }
      }

      // save tagStats
      for (const tagStatsItem of tagStatsData) {
        if (tagStatsItem._id) {
          // existing tag stats
          const exTagStats = tagStatsRef[tagStatsItem._id];
          exTagStats.set("yearlyTotal", tagStatsItem.yearlyTotal);
          exTagStats.set("monthlyData", tagStatsItem.monthlyData);
          exTagStats.set("dailyData", tagStatsItem.dailyData);
          await exTagStats.save({ session });
        } else {
          // new tag stats
          const exTagStats = new ExpenseTagStat(tagStatsItem, { session });
          await exTagStats.save({ session });
        }
      }

      // save typeStats
      if (typeStatsData._id) {
        // existing type stats
        typeStatsRef.set("yearlyTotal", typeStatsData.yearlyTotal);
        typeStatsRef.set("monthlyData", typeStatsData.monthlyData);
        typeStatsRef.set("dailyData", typeStatsData.dailyData);
        await typeStatsRef.save({ session });
      } else {
        // new type stats
        const typeStatsRef = new ExpenseTypeStat(typeStatsData);
        await typeStatsRef.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ id: trans._id });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: err.message });
    }

    // console.log( 'date : ', date, transactionData.dateZ )
    // console.log( 'date db: ', trans.date, trans.dateZ )
    // console.log( trans )
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTransactions = async (req, res) => {
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

    if (!sortFormatted.date) sortFormatted.date = -1;

    const transactions = await Transaction.find({
      userId: user._id,
      $or: [{ tags: { $regex: new RegExp(search, "i") } }],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Transaction.countDocuments({
      userId: user._id,
      $or: [{ tags: { $regex: new RegExp(search, "i") } }],
    });

    res.status(200).json({ transactions, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
