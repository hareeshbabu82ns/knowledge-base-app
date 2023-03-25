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

export const prepareTransaction = ({
  transaction: { amount, date, type, tags },
  user: { _id },
  tagStats = [],
  typeStats,
}) => {
  const transactionData = { userId: _id, amount, date, type, tags, dateZ: "" };
  const tagData = tags.map((t) => ({ userId: _id, tag: t.trim() }));
  const tagStatsData = [...tagStats];
  const typeStatsData = typeStats ? { ...typeStats } : { userId: _id, type };

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

      const currMonthlyDataIndex = tagStatsItem.monthlyData.findIndex(
        (d) => d.month === transactionMonth
      );
      if (currMonthlyDataIndex >= 0) {
        const currMonthlyData =
          tagStatsItem.monthlyData.at(currMonthlyDataIndex);
        const data = {
          ...currMonthlyData,
          total: currMonthlyData.total + amountCalc,
        };
        tagStatsItem.monthlyData.splice(currMonthlyDataIndex, 1, {
          ...data,
        });
      } else {
        tagStatsItem.monthlyData.push({
          month: transactionMonth,
          total: amountCalc,
        });
      }

      const currDailyDataIndex = tagStatsItem.dailyData.findIndex(
        (d) => d.date === transactionDay
      );
      if (currDailyDataIndex >= 0) {
        const currDailyData = tagStatsItem.dailyData.at(currDailyDataIndex);
        const data = {
          ...currDailyData,
          total: currDailyData.total + amountCalc,
        };
        tagStatsItem.dailyData.splice(currDailyDataIndex, 1, {
          ...data,
        });
      } else {
        tagStatsItem.dailyData.push({
          date: transactionDay,
          total: amountCalc,
        });
      }
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
        dailyData: [{ date: transactionDay, total: amountCalc }],
      };
    })
  );

  // Type Stats Logic
  if (typeStatsData._id) {
    // updating existing typeStats

    typeStatsData.yearlyTotal += amount;

    const currMonthlyDataIndex = typeStatsData.monthlyData.findIndex(
      (d) => d.month === transactionMonth
    );
    if (currMonthlyDataIndex >= 0) {
      const currMonthlyData =
        typeStatsData.monthlyData.at(currMonthlyDataIndex);
      const data = {
        ...currMonthlyData,
        total: currMonthlyData.total + amount,
      };
      typeStatsData.monthlyData.splice(currMonthlyDataIndex, 1, {
        ...data,
      });
    } else {
      typeStatsData.monthlyData.push({
        month: transactionMonth,
        total: amount,
      });
    }

    const currDailyDataIndex = typeStatsData.dailyData.findIndex(
      (d) => d.date === transactionDay
    );
    if (currDailyDataIndex >= 0) {
      const currDailyData = typeStatsData.dailyData.at(currDailyDataIndex);
      const data = {
        ...currDailyData,
        total: currDailyData.total + amount,
      };
      typeStatsData.dailyData.splice(currDailyDataIndex, 1, {
        ...data,
      });
    } else {
      typeStatsData.dailyData.push({ date: transactionDay, total: amount });
    }
  } else {
    // new typeStats
    typeStatsData.year = transactionYear;
    typeStatsData.yearlyTotal = amount;
    typeStatsData.monthlyData = [{ month: transactionMonth, total: amount }];
    typeStatsData.dailyData = [{ date: transactionDay, total: amount }];
  }

  return {
    transactionData,
    tagData,
    tagStatsData,
    typeStatsData,
  };
};
