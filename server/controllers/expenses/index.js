import mongoose from "mongoose";
import { DateTime } from "luxon";
import fs from "fs";

import { ACCOUNT_TYPES, EXPENSE_TYPES } from "../../models/Expenses/const.js";

import Transaction from "../../models/Expenses/ExpenseTransaction.js";
import Account from "../../models/Expenses/ExpenseAccount.js";
import {
  convFieldWithConfig,
  deriveExpenseTags,
  fillStatDates,
  genericIgnore,
  getClientDateTime,
  prepareDBObject,
  prepareTransaction,
  trimQuotes,
} from "./logic.js";
import ExpenseTag from "../../models/Expenses/ExpenseTag.js";
import ExpenseTagStat from "../../models/Expenses/ExpenseTagStat.js";
import ExpenseTypeStat from "../../models/Expenses/ExpenseTypeStat.js";
import ExpenseUserStat from "../../models/Expenses/ExpenseUserStat.js";
import ExpenseTransaction from "../../models/Expenses/ExpenseTransaction.js";
import ExpenseAccount from "../../models/Expenses/ExpenseAccount.js";

export const recalculateStatsForYear = async ({ year, user }) => {
  const tagStats = {};
  const typeStats = {};
  const userStats = {};
  const batchSize = 150;

  const dateFrom = DateTime.fromObject({ year });
  const dateTo = dateFrom.endOf("year");

  // fetch Account Configs for buffer
  const accountConfigs = (await ExpenseAccount.find({})).map((a) => ({
    ...a.toObject(),
    _id: a._id,
  }));

  // fetch initial set of transactions to process
  let trans = await ExpenseTransaction.find({
    date: { $gte: dateFrom.toISODate(), $lte: dateTo.toISODate() },
  }).limit(batchSize);
  let len = trans.length;
  let skip = len;

  while (len > 0) {
    trans.forEach((t) => {
      const {
        amount,
        account,
        description,
        tags,
        type,
        dateZ: date,
      } = t.toObject();

      // calculate stats
      const tagStatFiltered = Object.entries(tagStats)
        .filter(([tag, tagStat]) => tags.includes(tag))
        .map(([tag, tagStat]) => ({ ...tagStat }));

      const accountConfig = accountConfigs.find(
        (a) => a._id === account
      )?.config;

      const derivedTags = accountConfig
        ? deriveExpenseTags({
            config: accountConfig,
            obj: { amount, account, description, tags, type, date },
          })
        : tags;

      const { tagStatsData, typeStatsData, userStatsData } = prepareTransaction(
        {
          transaction: {
            amount,
            account,
            description,
            tags: derivedTags,
            type,
            date,
          },
          user,
          tagStats: tagStatFiltered,
          typeStats: typeStats[type],
          userStats: userStats[year],
        }
      );
      tagStatsData.forEach((t) => (tagStats[t.tag] = { ...t }));
      typeStats[type] = { ...typeStatsData, _id: "t" };
      userStats[year] = { ...userStatsData, _id: "t" };
    });

    // fetch next set of transactions to process
    trans = await ExpenseTransaction.find({
      date: { $gte: dateFrom.toISODate(), $lte: dateTo.toISODate() },
    })
      .skip(skip)
      .limit(batchSize);
    len = trans.length;
    skip = skip + len;
  }

  // save stats to db
  // const tagStatsDB = tagStats.map((t) => ({ ...t, _id: undefined }));
  const tagStatsDB = Object.values(tagStats).map((t) => ({
    ...t,
    _id: undefined,
  }));

  const typeStatsDB = Object.values(typeStats).map((t) => ({
    ...t,
    _id: undefined,
  }));
  const userStatsDB = Object.values(userStats).map((t) => ({
    ...t,
    _id: undefined,
  }));

  return {
    tagStats: tagStatsDB,
    typeStats: typeStatsDB,
    userStats: userStatsDB,
  };
};

// db transaction sample
// try {
//   session.startTransaction();

//   await session.commitTransaction();
//   await session.endSession();
// } catch (ex) {
//   console.log(ex);
//   await session.abortTransaction();
//   await session.endSession();
//   throw "Database update failed";
// }

export const recalculateStats = async (req, res) => {
  const tagStatsDB = [];
  const typeStatsDB = [];
  const userStatsDB = [];

  try {
    const { user } = req.auth;
    const { year } = req.query;

    // find min date
    const transMin = year
      ? {}
      : await ExpenseTransaction.findOne({}).limit(1).sort({ date: 1 });
    const transMax = year
      ? {}
      : await ExpenseTransaction.findOne({}).limit(1).sort({ date: -1 });

    const yearMin = year
      ? Number(year)
      : Number(transMin.get("dateZ").split("-")[0]);
    const yearMax = year
      ? Number(year)
      : Number(transMax.get("dateZ").split("-")[0]);

    const session = await mongoose.startSession();

    // procees for each year
    for (let year = yearMin; year <= yearMax; year++) {
      const { tagStats, typeStats, userStats } = await recalculateStatsForYear({
        year,
        user,
      });
      tagStatsDB.push(...tagStats);
      typeStatsDB.push(...typeStats);
      userStatsDB.push(...userStats);

      try {
        session.startTransaction();

        // delete db entries for current year
        await ExpenseTagStat.deleteMany({ year }, { session });
        await ExpenseTypeStat.deleteMany({ year }, { session });
        await ExpenseUserStat.deleteMany({ year }, { session });

        // save new db entries for current year
        await ExpenseTagStat.create(tagStats, { session });
        await ExpenseTypeStat.create(typeStats, { session });
        await ExpenseUserStat.create(userStats, { session });

        await session.commitTransaction();
        await session.endSession();
      } catch (ex) {
        console.log(ex);
        await session.abortTransaction();
        await session.endSession();
        throw "Database update failed";
      }
    } // end year loop

    res.status(201).json({
      message: "Stats Re-Calculated",
      tagStats: tagStatsDB,
      typeStats: typeStatsDB,
      userStats: userStatsDB,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ message: error });
  }

  // const tagStats = {};
  // const typeStats = {};
  // const userStats = {};

  // try {
  //   const { user } = req.auth;

  //   // delete existing stats
  //   await ExpenseTagStat.deleteMany({});
  //   await ExpenseTypeStat.deleteMany({});
  //   await ExpenseUserStat.deleteMany({});

  //   // fetch initial set of transactions to process
  //   let trans = await ExpenseTransaction.find().limit(150);
  //   let len = trans.length;
  //   let skip = 100;

  //   // while (len > 0) {

  //   trans.forEach((t) => {
  //     const {
  //       amount,
  //       account,
  //       description,
  //       tags,
  //       type,
  //       dateZ: date,
  //     } = t.toObject();

  //     const trClientDate = getClientDateTime({ date });
  //     const year = trClientDate.year;

  //     // calculate stats
  //     const {
  //       transactionData,
  //       tagData,
  //       tagStatsData,
  //       typeStatsData,
  //       userStatsData,
  //     } = prepareTransaction({
  //       transaction: { amount, account, description, tags, type, date },
  //       user,
  //       tagStats: tagStats[year],
  //       typeStats: typeStats[`${type}_${year}`],
  //       userStats: userStats[year],
  //     });
  //     tagStats[year] = [...tagStatsData];
  //     typeStats[`${type}_${year}`] = { ...typeStatsData, _id: "" };
  //     userStats[year] = { ...userStatsData, _id: "" };
  //   });

  //   //   // fetch next set of transactions to process
  //   //   trans = await ExpenseTransaction.find({}).skip(skip).limit(100);
  //   //   len = trans.length;
  //   //   skip = skip + len;
  //   // }

  //   // save stats to db
  //   const tagStatsDB = [];
  //   for (const tagYear of Object.keys(tagStats)) {
  //     tagStats[tagYear].forEach((tagStat) =>
  //       tagStatsDB.push({ ...tagStat, _id: undefined })
  //     );
  //   }
  //   const typeStatsDB = Object.values(typeStats).map((t) => ({
  //     ...t,
  //     _id: undefined,
  //   }));
  //   const userStatsDB = Object.values(userStats).map((t) => ({
  //     ...t,
  //     _id: undefined,
  //   }));

  //   const session = await mongoose.startSession();

  //   try {
  //     session.startTransaction();

  //     // await ExpenseTagStat.create(tagStatsDB, { session });
  //     // await ExpenseTypeStat.create(typeStatsDB, { session });
  //     await ExpenseUserStat.create(userStatsDB, { session });

  //     await session.commitTransaction();
  //     await session.endSession();
  //   } catch (ex) {
  //     console.log(ex);
  //     await session.abortTransaction();
  //     await session.endSession();
  //     throw "Database update failed";
  //   }

  //   res.status(201).json({
  //     message: "Stats Re-Calculated",
  //     tagStats: tagStatsDB,
  //     typeStats: typeStatsDB,
  //     userStats: userStatsDB,
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(501).json({ message: error });
  // }
};

// Transactions //
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

    const { amount, tags, type, date: jsDate } = oldTransaction.toObject();

    const date = jsDate.toISOString();

    // console.log(DateTime.fromJSDate(date));

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

    const userStatsRef = await ExpenseUserStat.findOne({
      userId: user._id,
      year: transactionYear,
    });

    const userStats = userStatsRef ? userStatsRef.toObject() : undefined;

    const { tagStatsData, typeStatsData, userStatsData } = prepareTransaction({
      transaction: {
        amount: amount * -1, // do a reverse posting
        tags,
        type,
        date,
      },
      user,
      tagStats,
      typeStats,
      userStats,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // delete transaction entry
      const trans = await oldTransaction.deleteOne({ session });

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

      // save userStats
      if (userStatsData._id) {
        // existing user stats
        userStatsRef.set("yearlyTotal", userStatsData.yearlyTotal);
        userStatsRef.set("monthlyData", userStatsData.monthlyData);
        userStatsRef.set("dailyData", userStatsData.dailyData);
        await userStatsRef.save({ session });
      } else {
        // new user stats
        const userStatsRef = new ExpenseUserStat(userStatsData);
        await userStatsRef.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ id: oldTransaction._id });
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

export const updateTransaction = async (req, res) => {
  // TODO: still need to add logic to update stats based on new values
  // for now prefer deleting and adding the entry
  try {
    const { user } = req.auth;

    const { amount, account, description, tags, type, dateUTC } = req.body;

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
      account,
      description,
      tags,
      type,
      date: dateUTC,
    });

    oldTransaction.set({
      userId: user._id,
      amount,
      account,
      description,
      tags,
      type,
      date: dateUTC,
    });

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

const addExpenseTransaction = async (
  { amount, account, description, tags, type, date },
  user
) => {
  const isValid = validateTransactionData({
    amount,
    account,
    description,
    tags,
    type,
    date,
  });

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

  const userStatsRef = await ExpenseUserStat.findOne({
    userId: user._id,
    year: transactionYear,
  });

  const userStats = userStatsRef ? userStatsRef.toObject() : undefined;

  const {
    transactionData,
    tagData,
    tagStatsData,
    typeStatsData,
    userStatsData,
  } = prepareTransaction({
    transaction: { amount, account, description, tags, type, date },
    user,
    tagStats,
    typeStats,
    userStats,
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

    // save userStats
    if (userStatsData._id) {
      // existing user stats
      userStatsRef.set("yearlyTotal", userStatsData.yearlyTotal);
      userStatsRef.set("monthlyData", userStatsData.monthlyData);
      userStatsRef.set("dailyData", userStatsData.dailyData);
      await userStatsRef.save({ session });
    } else {
      // new user stats
      const userStatsRef = new ExpenseUserStat(userStatsData);
      await userStatsRef.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return { transaction: trans, error: undefined };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return { transaction: undefined, error: err.message };
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { user } = req.auth;

    const { amount, account, description, tags, type, date } = req.body;

    const { transaction, error } = await addExpenseTransaction(
      {
        amount,
        account,
        description,
        tags,
        type,
        date,
      },
      user
    );

    if (error) {
      res.status(404).json({ message: error });
    } else {
      res.status(201).json({ id: transaction._id });
    }
    // console.log( 'date : ', date, transactionData.dateZ )
    // console.log( 'date db: ', trans.date, trans.dateZ )
    // console.log( trans )
  } catch (err) {
    console.log(err);
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
      $or: [
        { tags: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Transaction.countDocuments({
      userId: user._id,
      $or: [
        { tags: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ],
    });

    res.status(200).json({ transactions, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Accounts //

const validateAccountData = ({ name, type, description }) => {
  if (name === 0) {
    throw new Error("name can not be empty");
  }

  if (!ACCOUNT_TYPES.includes(type)) {
    throw new Error("account type not valid");
  }

  return true;
};

export const deleteAccount = async (req, res) => {
  try {
    const { user } = req.auth;

    const { id } = req.params;

    // fetch existing transaction
    const oldAccount = await Account.findById(new mongoose.Types.ObjectId(id));
    // console.log( oldAccount )

    if (!oldAccount) throw new Error(`No Account found with id ${id}`);

    if (oldAccount.userId !== user.id)
      throw new Error(`Account is not from same user`);

    // const { name, type } = oldAccount.toObject();

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // delete transaction entry
      const trans = await oldAccount.deleteOne({ session });

      // TODO delete related transactions

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ id: oldAccount._id });
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

export const updateAccount = async (req, res) => {
  try {
    const { user } = req.auth;

    const { name, type, description, config } = req.body;

    const { id } = req.params;

    // fetch existing transaction
    const oldAccount = await Account.findById(id);
    // console.log( oldAccount )

    if (!oldAccount) throw new Error(`No Account found with id ${id}`);

    if (oldAccount.userId !== user.id)
      throw new Error(`Account is not from same user`);

    const isValid = validateAccountData({
      name,
      type,
      description,
      config,
    });
    if (!isValid) {
      res.status(500).json({ message: "Account validation failed" });
      return;
    }

    oldAccount.set({ userId: user._id, name, type, description, config });

    const trans = await oldAccount.save();

    res.status(200).json({ id: oldAccount._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const addAccount = async (req, res) => {
  try {
    const { user } = req.auth;

    const { name, type, description, config } = req.body;

    const isValid = validateAccountData({ name, type, description, config });
    if (!isValid) {
      res.status(500).json({ message: "Account validation failed" });
      return;
    }

    try {
      const newAccount = new Account({
        _id: Buffer.from(name).toString("base64"),
        userId: user._id,
        name,
        type,
        description,
        config,
      });

      const trans = await newAccount.save();

      res.status(201).json({ id: trans._id });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAccounts = async (req, res) => {
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

    const accounts = await Account.find({
      userId: user._id,
      $or: [{ name: { $regex: new RegExp(search, "i") } }],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Account.countDocuments({
      userId: user._id,
      $or: [{ name: { $regex: new RegExp(search, "i") } }],
    });

    res.status(200).json({ accounts, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Utils //
export const processUpload = async (req, res) => {
  const { user } = req.auth;
  // console.log(req.body);

  // check if bank config exists
  const accountDB = await Account.findById(req.body.bankAccount);
  if (!accountDB) {
    res.status(500).json({ message: "bank config not found" });
    return;
  }

  const config = accountDB.get("config").toJSON();

  // read csv file
  const fileContentsRaw = fs.readFileSync(`tmp/${req.body.file}`, "utf8");

  const fileContents = fileContentsRaw.toString().split(`\n`);

  const dataToUpload = [];
  const dataMdb = [];

  try {
    fileContents.forEach((line, lineIndex) => {
      if (line.trim().length === 0) return;
      if (config.headerLines > lineIndex) return;

      const fieldDataRaw = [];
      const fieldDataRawTmp = line.split(config.separator);

      if (fieldDataRawTmp.length !== config.fileFields.length) {
        // try correcting the line
        config?.textToAdjust
          .filter((f) => f.scope === "line")
          .forEach((s) => {
            line = line.replace(s.source, s.replaceWith);
          });

        const fieldDataTmp = line.split(config.separator);
        if (fieldDataTmp.length === config.fileFields.length) {
          // seems corrected
          fieldDataRaw.push(...fieldDataTmp);
        } else {
          console.log("config mismatch", fieldDataTmp);
          res.status(500).json({
            message: `${config.bank}: fileFields per line do not match with config`,
            fileFileds: fieldDataTmp.length,
            configFields: config.fileFields.length,
            fieldData: fieldDataTmp,
          });
          throw "conversion failed";
        }
      } else {
        fieldDataRaw.push(...fieldDataRawTmp);
      }

      // prepare mongo objects to save to db
      const obj = config.fileFields.reduce((acc, fieldConfig, index) => {
        const fieldValRaw = trimQuotes(fieldDataRaw[index]);
        const fieldName = fieldConfig.name;

        const fieldVal = convFieldWithConfig({
          fieldValRaw,
          fieldConfig,
          fieldDataLineRaw: fieldDataRaw,
        });
        // console.log(fieldName, fieldVal);
        if (fieldConfig.ignore) return acc;
        return { ...acc, [fieldName]: fieldVal };
      }, {});

      // console.log(obj);
      const objToUpload = {
        ...obj,
        bankAccount: req.body.bankAccount,
      };
      dataToUpload.push(objToUpload);
      // console.log("done", dataToUpload.length);

      // prepare database object
      const mdbObj = prepareDBObject({
        accountName: accountDB.get("name"),
        config,
        objToUpload,
      });

      // eliminate ignored values
      const ignoreLine = genericIgnore({ config, obj: mdbObj });
      if (!ignoreLine) {
        dataMdb.push(mdbObj);
      }

      // console.log("mdb obj: ", mdbObj);
    });
  } catch (ex) {
    console.log(ex);
    console.log("convertion failed");
    return;
  }

  // upload to MongoDB
  const dataMdbUploaded = [];
  for (const mdbObj of dataMdb) {
    const { transaction } = await addExpenseTransaction(mdbObj, user);
    dataMdbUploaded.push({ ...mdbObj, _id: transaction._id });
  }
  // dataMdbUploaded.push(...dataMdb);

  console.log(dataToUpload.length, dataToUpload[dataToUpload.length - 1]);
  console.log(dataMdb.length, dataMdb[dataMdb.length - 1]);

  // delete file at the end
  fs.rmSync(`tmp/${req.body.file}`);

  res.status(201).json({
    message: "file processed",
    config,
    data: dataToUpload,
    dataMdb: dataMdbUploaded,
  });
};

export const getUserStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    // depth in yearly monthly daily
    const { dateFrom, dateTo, depth = "yearly", fillTimeline = "" } = req.query;

    const clientDateFrom = dateFrom
      ? getClientDateTime({ date: dateFrom })
      : DateTime.now();
    const transactionYearFrom = clientDateFrom.year;
    const transactionMonthFrom = clientDateFrom.month;
    const transactionDayFrom = clientDateFrom.day;

    const clientDateTo = dateTo
      ? getClientDateTime({ date: dateTo })
      : DateTime.now();
    const transactionYearTo = clientDateTo.year;
    const transactionMonthTo = clientDateTo.month;
    const transactionDayTo = clientDateTo.day;

    const query = {
      userId: user._id,
      year: { $gte: transactionYearFrom, $lte: transactionYearTo },
    };

    const projection = {};
    if (depth === "yearly") {
      projection["monthlyData"] = 0;
      projection["dailyData"] = 0;
    }
    if (depth === "monthly") {
      projection["dailyData"] = 0;
    }

    const sort = { year: 1 };

    const statsDB = await ExpenseUserStat.find(query, projection).sort(sort);

    // sort monthly data
    const stats = statsDB.map((s) => {
      var ret = true;
      const sjson = s.toJSON();

      const monthlyData = sjson.monthlyData
        ?.filter((v) =>
          filterStats({
            transactionYearFrom,
            transactionYearTo,
            transactionMonthFrom,
            transactionMonthTo,
            year: sjson.year,
            month: v.month,
          })
        )
        .sort((a, b) => a.month - b.month);

      const dailyData = sjson.dailyData
        ?.filter((v) =>
          filterDailyStats({
            dateFrom: clientDateFrom,
            dateTo: clientDateTo,
            date: DateTime.fromObject({
              year: sjson.year,
              month: v.month,
              day: v.date,
            }),
          })
        )
        .sort((a, b) => a.month * 100 + a.date - (b.month * 100 + b.date));
      return {
        ...sjson,
        monthlyData,
        dailyData,
      };
    });

    if (fillTimeline === "X") {
      const statArr = [];

      stats.forEach((stat) => {
        if (depth === "yearly") {
          statArr.push({
            year: stat.year,
            total: stat.yearlyTotal,
            // id: stat._id,
          });
        } else if (depth === "monthly") {
          const arr = stat.monthlyData?.map(({ month, total, _id }) => ({
            year: stat.year,
            month,
            total,
            // id: _id,
          }));
          statArr.push(...arr);
        } else if (depth === "daily") {
          const arr = stat.dailyData?.map(({ month, date, total, _id }) => ({
            year: stat.year,
            month,
            day: date,
            total,
            // id: _id,
          }));
          statArr.push(...arr);
        }
      });

      const statsFilled = fillStatDates({
        statArr,
        depth,
        dateFrom: clientDateFrom,
        dateTo: clientDateTo,
      });
      res.status(200).json({ stats: statsFilled });
      return;
    }

    res.status(200).json({ stats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTypeStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    const {
      type,
      dateFrom,
      dateTo,
      depth = "yearly",
      fillTimeline = "",
    } = req.query;

    const clientDateFrom = dateFrom
      ? getClientDateTime({ date: dateFrom })
      : DateTime.now();
    const transactionYearFrom = clientDateFrom.year;
    const transactionMonthFrom = clientDateFrom.month;
    const transactionDayFrom = clientDateFrom.day;

    const clientDateTo = dateTo
      ? getClientDateTime({ date: dateTo })
      : DateTime.now();
    const transactionYearTo = clientDateTo.year;
    const transactionMonthTo = clientDateTo.month;
    const transactionDayTo = clientDateTo.day;

    const query = {
      userId: user._id,
      year: { $gte: transactionYearFrom, $lte: transactionYearTo },
    };
    if (type) query["type"] = type;

    const projection = {};
    if (depth === "yearly") {
      projection["monthlyData"] = 0;
      projection["dailyData"] = 0;
    }
    if (depth === "monthly") {
      projection["dailyData"] = 0;
    }

    const sort = {
      year: 1,
    };

    const statsDB = await ExpenseTypeStat.find(query, projection).sort(sort);

    // sort monthly data
    const stats = statsDB.map((s) => {
      const sjson = s.toJSON();
      const monthlyData = sjson.monthlyData
        ?.filter((v) =>
          filterStats({
            transactionYearFrom,
            transactionYearTo,
            transactionMonthFrom,
            transactionMonthTo,
            year: sjson.year,
            month: v.month,
          })
        )
        .sort((a, b) => a.month - b.month);
      const dailyData = sjson.dailyData
        ?.filter((v) =>
          filterDailyStats({
            dateFrom: clientDateFrom,
            dateTo: clientDateTo,
            date: DateTime.fromObject({
              year: sjson.year,
              month: v.month,
              day: v.date,
            }),
          })
        )
        .sort((a, b) => a.month * 100 + a.date - (b.month * 100 + b.date));
      return {
        ...sjson,
        monthlyData,
        dailyData,
      };
    });

    const statsByType = {};

    stats.forEach((stat) => {
      const statArr = statsByType[stat.type] || [];

      if (depth === "yearly") {
        statArr.push({
          year: stat.year,
          total: stat.yearlyTotal,
          // id: stat._id,
        });
      } else if (depth === "monthly") {
        const arr = stat.monthlyData?.map(({ month, total, _id }) => ({
          year: stat.year,
          month,
          total,
          // id: _id,
        }));
        statArr.push(...arr);
      } else if (depth === "daily") {
        const arr = stat.dailyData?.map(({ month, date, total, _id }) => ({
          year: stat.year,
          month,
          day: date,
          total,
          // id: _id,
        }));
        statArr.push(...arr);
      }

      if (statArr.length > 0) statsByType[stat.type] = statArr;
    });

    if (fillTimeline === "X")
      Object.keys(statsByType).forEach((type) => {
        statsByType[type] = fillStatDates({
          statArr: statsByType[type],
          depth,
          dateFrom: clientDateFrom,
          dateTo: clientDateTo,
        });
      });

    res.status(200).json({ stats: statsByType });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTagStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    const {
      tag,
      dateFrom,
      dateTo,
      depth = "yearly",
      fillTimeline = "",
    } = req.query;

    const clientDateFrom = dateFrom
      ? getClientDateTime({ date: dateFrom })
      : DateTime.now();
    const transactionYearFrom = clientDateFrom.year;
    const transactionMonthFrom = clientDateFrom.month;
    const transactionDayFrom = clientDateFrom.day;

    const clientDateTo = dateTo
      ? getClientDateTime({ date: dateTo })
      : DateTime.now();
    const transactionYearTo = clientDateTo.year;
    const transactionMonthTo = clientDateTo.month;
    const transactionDayTo = clientDateTo.day;

    const query = {
      userId: user._id,
      year: { $gte: transactionYearFrom, $lte: transactionYearTo },
    };
    if (tag) {
      query["tag"] = tag;
    }

    const projection = {};
    if (depth === "yearly") {
      projection["monthlyData"] = 0;
      projection["dailyData"] = 0;
    }
    if (depth === "monthly") {
      projection["dailyData"] = 0;
    }

    const sort = {
      year: 1,
    };

    const statsDB = await ExpenseTagStat.find(query, projection).sort(sort);

    // sort monthly data
    const stats = statsDB.map((s) => {
      var ret = true;
      const sjson = s.toJSON();
      const monthlyData = sjson.monthlyData
        ?.filter((v) =>
          filterStats({
            transactionYearFrom,
            transactionYearTo,
            transactionMonthFrom,
            transactionMonthTo,
            year: sjson.year,
            month: v.month,
          })
        )
        .sort((a, b) => a.month - b.month);
      const dailyData = sjson.dailyData
        ?.filter((v) =>
          filterDailyStats({
            dateFrom: clientDateFrom,
            dateTo: clientDateTo,
            date: DateTime.fromObject({
              year: sjson.year,
              month: v.month,
              day: v.date,
            }),
          })
        )
        .sort((a, b) => a.month * 100 + a.date - (b.month * 100 + b.date));
      return {
        ...sjson,
        monthlyData,
        dailyData,
      };
    });

    const statsByTag = {};

    stats.forEach((stat) => {
      const statArr = statsByTag[stat.tag] || [];

      if (depth === "yearly") {
        statArr.push({
          year: stat.year,
          total: stat.yearlyTotal,
          // id: stat._id,
        });
      } else if (depth === "monthly") {
        const arr = stat.monthlyData?.map(({ month, total, _id }) => ({
          year: stat.year,
          month,
          total,
          // id: _id,
        }));
        statArr.push(...arr);
      } else if (depth === "daily") {
        const arr = stat.dailyData?.map(({ month, date, total, _id }) => ({
          year: stat.year,
          month,
          day: date,
          total,
          // id: _id,
        }));
        statArr.push(...arr);
      }

      if (statArr.length > 0) statsByTag[stat.tag] = statArr;
    });

    if (fillTimeline === "X")
      Object.keys(statsByTag).forEach((tag) => {
        statsByTag[tag] = fillStatDates({
          statArr: statsByTag[tag],
          depth,
          dateFrom: clientDateFrom,
          dateTo: clientDateTo,
        });
      });

    res.status(200).json({ stats: statsByTag });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const filterStats = ({
  transactionYearFrom,
  transactionYearTo,
  transactionMonthFrom,
  transactionMonthTo,
  year,
  month,
}) => {
  if (transactionYearFrom === transactionYearTo) {
    return month >= transactionMonthFrom && month <= transactionMonthTo;
  }
  if (year === transactionYearFrom) {
    return month >= transactionMonthFrom;
  }
  if (year === transactionYearTo) {
    return month <= transactionMonthTo;
  }
  return true;
};

const filterDailyStats = ({ dateFrom, dateTo, date }) => {
  const diffFrom = date.diff(dateFrom);
  const diffTo = dateTo.diff(date);

  if (diffFrom.milliseconds > 0 && diffTo.milliseconds > 0) return true;
  // console.log(date.toISO(), dateFrom.toISO(), diffFrom.milliseconds);
  // console.log(date.toISO(), dateTo.toISO(), diffTo.milliseconds);

  return false;
};
