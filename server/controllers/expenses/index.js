import mongoose from "mongoose";
import { DateTime } from "luxon";
import fs from "fs";

import {
  ACCOUNT_TYPES,
  EXPENSE_FIELD_AMOUNT,
  EXPENSE_FIELD_DATE,
  EXPENSE_FIELD_DESCRIPTION,
  EXPENSE_FIELD_NONE,
  EXPENSE_TYPES,
  EXPENSE_FIELDS,
  EXPENSE_TYPE_EXPENSE,
  EXPENSE_TYPE_COND_EXPENSE_IF_GT_0,
  EXPENSE_TYPE_COND_INCOME_IF_GT_0,
  EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME,
  EXPENSE_TYPE_INCOME,
  EXPENSE_TYPE_COND_INCOME_IF_GT_0_EL_EXPENSE,
  COMPARISION_OPS_EQ,
  COMPARISION_OPS_NE,
  COMPARISION_OPS_STARTS_WITH,
  COMPARISION_OPS_CONTAINS,
} from "../../models/Expenses/const.js";

import Transaction from "../../models/Expenses/ExpenseTransaction.js";
import Account from "../../models/Expenses/ExpenseAccount.js";
import { getClientDateTime, prepareTransaction } from "./logic.js";
import ExpenseTag from "../../models/Expenses/ExpenseTag.js";
import ExpenseTagStat from "../../models/Expenses/ExpenseTagStat.js";
import ExpenseTypeStat from "../../models/Expenses/ExpenseTypeStat.js";
import ExpenseUserStat from "../../models/Expenses/ExpenseUserStat.js";
import { BANK_TRANSACTION_CONV_CONFIG, KNOWN_COMMA_STRINGS } from "../utils.js";

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
    const oldAccount = await Account.findById(new mongoose.Types.ObjectId(id));
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
  // const data = {};

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
        KNOWN_COMMA_STRINGS.forEach((s) => {
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

      // upload to MongoDB

      // const mdbConvConfig = BANK_TRANSACTION_CONV_CONFIG.find(
      //   (c) => c.account === accountDB.get("name")
      // );
      // // const mdbConvConfig = accountDB.get("config");

      // if (!mdbConvConfig) {
      //   res.status(500).json({
      //     message: `${accountDB.get("name")}: config not found`,
      //   });
      //   throw `${accountDB.get("name")}: config not found`;
      // }

      const baseExpenseObj = {
        account: objToUpload.bankAccount,
        tags: [accountDB.get("name")],
      };

      // fill expense model fields
      const mdbObj = EXPENSE_FIELDS.reduce((acc, field, index) => {
        const fieldAssigns = config.fileFields.filter(
          (f) => f?.expenseColumn === field
        );
        var value = "";

        switch (field) {
          case EXPENSE_FIELD_DATE:
            value = objToUpload[fieldAssigns[0].name];
            break;

          case EXPENSE_FIELD_DESCRIPTION:
            value = fieldAssigns
              .reduce((a, f) => `${a} ${objToUpload[f.name].trim()}`, "")
              .trim();
            break;

          case EXPENSE_FIELD_AMOUNT:
            value = fieldAssigns.reduce(
              (a, f) => a + Math.abs(objToUpload[f.name]),
              0
            );
            break;

          case EXPENSE_FIELD_NONE:
          default:
            return acc;
        }

        return { ...acc, [field]: value };
      }, baseExpenseObj);

      // find expense type
      const expenseType = config.fileFields.reduce((acc, field, index) => {
        switch (field.expenseType) {
          case EXPENSE_TYPE_COND_EXPENSE_IF_GT_0:
            if (objToUpload[field.name] > 0) acc = EXPENSE_TYPE_EXPENSE;
            break;
          case EXPENSE_TYPE_COND_INCOME_IF_GT_0:
            if (objToUpload[field.name] > 0) acc = EXPENSE_TYPE_INCOME;
            break;
          case EXPENSE_TYPE_COND_EXPENSE_IF_GT_0_EL_INCOME:
            acc =
              objToUpload[field.name] > 0
                ? EXPENSE_TYPE_EXPENSE
                : EXPENSE_TYPE_INCOME;
            break;
          case EXPENSE_TYPE_COND_INCOME_IF_GT_0_EL_EXPENSE:
            acc =
              objToUpload[field.name] > 0
                ? EXPENSE_TYPE_INCOME
                : EXPENSE_TYPE_EXPENSE;
            break;
        }
        return acc;
      }, EXPENSE_TYPE_EXPENSE);

      mdbObj["type"] = expenseType;

      // const mdbObj = mdbConvConfig.fields.reduce((acc, fieldConfig, index) => {
      //   const value = fieldConfig.prepare({
      //     config: fieldConfig,
      //     objToUpload,
      //   });
      //   return { ...acc, [fieldConfig.name]: value };
      // }, baseExpenseObj);

      // eliminate ignored values
      const ignoreLine = genericIgnore({ config, obj: mdbObj });
      if (!ignoreLine) {
        dataMdb.push(mdbObj);
      }

      // if (!mdbConvConfig.ignore({ obj: mdbObj })) {
      //   dataMdb.push(mdbObj);
      // }

      // console.log("mdb obj: ", mdbObj);
    });
  } catch (ex) {
    console.log(ex);
    console.log("convertion failed");
    return;
  }

  const dataMdbUploaded = [];
  // for (const mdbObj of dataMdb) {
  //   const { transaction } = await addExpenseTransaction(mdbObj, user);
  //   dataMdbUploaded.push({ ...mdbObj, _id: transaction._id });
  // }
  dataMdbUploaded.push(...dataMdb);

  console.log(dataToUpload.length, dataToUpload[dataToUpload.length - 1]);
  console.log(dataMdb.length, dataMdb[dataMdb.length - 1]);
  res.status(201).json({
    message: "file processed",
    config,
    data: dataToUpload,
    dataMdb: dataMdbUploaded,
  });
};

const genericIgnore = ({ config, obj }) => {
  for (const ignore of config.ignoreOps) {
    if (ignore.name === "description") {
      switch (ignore.comparision) {
        case COMPARISION_OPS_EQ:
          if (obj[ignore.name] === ignore.value) return true;
          break;
        case COMPARISION_OPS_NE:
          if (obj[ignore.name] !== ignore.value) return true;
          break;
        case COMPARISION_OPS_CONTAINS:
          if (obj[ignore.name].includes(ignore.value)) return true;
          break;
        case COMPARISION_OPS_STARTS_WITH:
          if (obj[ignore.name].startsWith(ignore.value)) return true;
          break;
      }
    }
  }
  return false;
};

const trimQuotes = (val) => {
  if (typeof val === "string") {
    return val.replace(/^["']+|["']+$/g, "");
  }
  return val;
};

const convFieldWithConfig = ({
  fieldValRaw,
  fieldConfig,
  fieldDataLineRaw,
}) => {
  switch (fieldConfig.type) {
    case "date":
      return DateTime.fromFormat(fieldValRaw, fieldConfig.format).toISO();
    case "dateTime":
      const dateStr =
        fieldValRaw +
        " " +
        trimQuotes(fieldDataLineRaw[fieldConfig.timeColumnIndex - 1] || "");
      return DateTime.fromFormat(dateStr, fieldConfig.format).toISO();
    case "amount":
      return fieldValRaw.trim().length === 0
        ? 0
        : parseFloat(fieldValRaw) * (fieldConfig?.negated ? -1 : 1);
    default:
      return fieldValRaw.trim();
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    // depth in yearly monthly daily
    const { dateFrom, dateTo, depth = "yearly" } = req.query;

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

    const stats = await ExpenseUserStat.find(query, projection).sort(sort);

    res.status(200).json({ stats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTypeStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    const { type, dateFrom, dateTo, depth = "yearly" } = req.query;

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

    const stats = await ExpenseTypeStat.find(query, projection).sort(sort);

    res.status(200).json({ stats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTagStats = async (req, res) => {
  try {
    const { user } = req.auth;

    // dates in ISO format
    const { tag, dateFrom, dateTo, depth = "yearly" } = req.query;

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

    const stats = await ExpenseTagStat.find(query, projection).sort(sort);

    res.status(200).json({ stats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
