import { DateTime } from "luxon";
import {
  EXPENSE_TYPE_EXPENSE,
  EXPENSE_TYPE_INCOME,
} from "../../models/Expenses/const.js";

export const getClientDateTime = ({ date }) => {
  const transactionDate = DateTime.fromISO(date, { zone: "utc" });
  const trClientDate = DateTime.fromISO(transactionDate);
  return trClientDate;
};

const updateMonthlyData = (monthlyData, { transactionMonth, amountCalc }) => {
  const currMonthlyDataIndex = monthlyData.findIndex(
    (d) => d.month === transactionMonth
  );
  if (currMonthlyDataIndex >= 0) {
    const currMonthlyData = monthlyData.at(currMonthlyDataIndex);
    const data = {
      ...currMonthlyData,
      total: currMonthlyData.total + amountCalc,
    };
    monthlyData.splice(currMonthlyDataIndex, 1, {
      ...data,
    });
  } else {
    monthlyData.push({
      month: transactionMonth,
      total: amountCalc,
    });
  }
};

const updateDailyData = (
  dailyData,
  { transactionMonth, transactionDay, amountCalc }
) => {
  const currDailyDataIndex = dailyData.findIndex(
    (d) => d.month === transactionMonth && d.date === transactionDay
  );
  if (currDailyDataIndex >= 0) {
    const currDailyData = dailyData.at(currDailyDataIndex);
    const data = {
      ...currDailyData,
      total: currDailyData.total + amountCalc,
    };
    dailyData.splice(currDailyDataIndex, 1, {
      ...data,
    });
  } else {
    dailyData.push({
      month: transactionMonth,
      date: transactionDay,
      total: amountCalc,
    });
  }
};

export const prepareTransaction = ({
  transaction: { amount, account, description, date, type, tags },
  user: { _id },
  tagStats = [],
  typeStats,
  userStats,
}) => {
  const transactionData = {
    userId: _id,
    amount,
    account,
    description,
    date,
    type,
    tags,
    dateZ: "",
  };
  const tagData = tags.map((t) => ({ userId: _id, tag: t.trim() }));
  const tagStatsData = [...tagStats];
  const typeStatsData = typeStats ? { ...typeStats } : { userId: _id, type };
  const userStatsData = userStats ? { ...userStats } : { userId: _id };

  const trClientDate = getClientDateTime({ date });
  transactionData.dateZ = trClientDate.toISO();

  // console.log(transactionDate.toISO());
  // console.log(trClientDate.toISO());

  const transactionDay = trClientDate.day;
  const transactionMonth = trClientDate.month;
  const transactionYear = trClientDate.year;

  const amountCalc = type === EXPENSE_TYPE_EXPENSE ? amount * -1 : amount;

  // Tag Stats Logic
  if (tagStatsData.length > 0) {
    // update existing tagStats
    for (const tagStatsItem of tagStatsData) {
      tagStatsItem.yearlyTotal += amountCalc;

      updateMonthlyData(tagStatsItem.monthlyData, {
        transactionMonth,
        amountCalc,
      });

      updateDailyData(tagStatsItem.dailyData, {
        transactionMonth,
        transactionDay,
        amountCalc,
      });
    }
  }

  // prepare tagStats for new tags
  const tagStatsNew = tagData.filter(
    ({ tag }) =>
      tagStatsData.findIndex(({ tag: tagStatTag }) => tagStatTag === tag) < 0
  );
  // console.log(tagStatsNew);

  // add new tagStats
  tagStatsData.push(
    ...tagStatsNew.map(({ tag }) => {
      return {
        userId: _id,
        tag: tag,
        year: transactionYear,
        yearlyTotal: amountCalc,
        monthlyData: [{ month: transactionMonth, total: amountCalc }],
        dailyData: [
          { month: transactionMonth, date: transactionDay, total: amountCalc },
        ],
      };
    })
  );

  // Type Stats Logic
  if (typeStatsData._id) {
    // updating existing typeStats

    typeStatsData.yearlyTotal += amount;

    updateMonthlyData(typeStatsData.monthlyData, {
      transactionMonth,
      amountCalc: amount,
    });

    updateDailyData(typeStatsData.dailyData, {
      transactionMonth,
      transactionDay,
      amountCalc: amount,
    });
  } else {
    // new typeStats
    typeStatsData.year = transactionYear;
    typeStatsData.yearlyTotal = amount;
    typeStatsData.monthlyData = [{ month: transactionMonth, total: amount }];
    typeStatsData.dailyData = [
      { month: transactionMonth, date: transactionDay, total: amount },
    ];
  }

  // User Stats Logic
  if (userStatsData._id) {
    // updating existing userStats

    userStatsData.yearlyTotal += amountCalc;

    updateMonthlyData(userStatsData.monthlyData, {
      transactionMonth,
      amountCalc,
    });

    updateDailyData(userStatsData.dailyData, {
      transactionMonth,
      transactionDay,
      amountCalc,
    });
  } else {
    // new userStats
    userStatsData.year = transactionYear;
    userStatsData.yearlyTotal = amountCalc;
    userStatsData.monthlyData = [
      { month: transactionMonth, total: amountCalc },
    ];
    userStatsData.dailyData = [
      { month: transactionMonth, date: transactionDay, total: amountCalc },
    ];
  }

  return {
    transactionData,
    tagData,
    tagStatsData,
    typeStatsData,
    userStatsData,
  };
};

export const fillStatDates = ({ statArr = [], depth, dateFrom, dateTo }) => {
  const filledStats = fillDates({ depth, dateFrom, dateTo });

  return filledStats.map((stat) => {
    const statOriginal =
      depth === "yearly"
        ? statArr.find((s) => s.year === stat.year)
        : depth === "monthly"
        ? statArr.find((s) => s.year === stat.year && s.month === stat.month)
        : statArr.find(
            (s) =>
              s.year === stat.year &&
              s.month === stat.month &&
              s.day === stat.day
          );
    return statOriginal ? { ...statOriginal } : { ...stat };
  });
};

export const fillDates = ({ depth, dateFrom, dateTo }) => {
  const result = [];
  let currDate =
    depth === "yearly"
      ? dateFrom.startOf("year")
      : depth === "monthly"
      ? dateFrom.startOf("month")
      : dateFrom;

  while (currDate.diff(dateTo).valueOf() < 0) {
    // Extract the year, month, and day for currDate
    const year = currDate.year;
    const month = depth === "monthly" ? currDate.month : undefined;
    const day = depth === "daily" ? currDate.day : undefined;
    // Create the array format of the date and add it to result
    result.push({ year, month, day, total: 0 });
    // Increment to the next day
    currDate = currDate.plus({
      days: depth === "daily" ? 1 : 0,
      months: depth === "monthly" ? 1 : 0,
      years: depth === "yearly" ? 1 : 0,
    });
  }
  return result;
};
