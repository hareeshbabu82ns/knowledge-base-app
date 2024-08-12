import { prepareTransaction } from "./logic.js";
import {
  simpleTestIncome,
  simpleTestExpense,
  typeStatsSimpleIncome,
  typeStatsSimpleExpense,
  tagStatsSimpleIncome,
  tagStatsNewTags,
  tagStatsSimpleExpense,
  userStatsSimpleIncome,
  userStatsSimpleExpense,
} from "./logic.test.data.js";

describe("prepareTransaction - Simple Test - Income", () => {
  test("should return transactionData, tagData, tagStat and typeStats", () => {
    const {
      transactionData,
      tagData,
      tagStatsData,
      typeStatsData,
      userStatsData,
    } = prepareTransaction(simpleTestIncome.transactionDataIn);
    expect(transactionData).toBeDefined();
    expect(tagData).toBeDefined();
    expect(tagStatsData).toBeDefined();
    expect(typeStatsData).toBeDefined();
    expect(userStatsData).toBeDefined();
  });

  test("should return transactionData", () => {
    const { transactionData } = prepareTransaction(
      simpleTestIncome.transactionDataIn
    );
    expect(transactionData).toStrictEqual(simpleTestIncome.transactionDataOut);
  });

  test("should return tagData", () => {
    const { tagData } = prepareTransaction(simpleTestIncome.transactionDataIn);
    expect(tagData).toStrictEqual(simpleTestIncome.tagsDataOut);
  });

  test("should return tagStatsData", () => {
    const { tagStatsData } = prepareTransaction(
      simpleTestIncome.transactionDataIn
    );
    expect(tagStatsData).toStrictEqual(simpleTestIncome.tagStatsDataOut);
  });

  test("should return typeStatsData", () => {
    const { typeStatsData } = prepareTransaction(
      simpleTestIncome.transactionDataIn
    );
    expect(typeStatsData).toStrictEqual(simpleTestIncome.typeStatsDataOut);
  });

  test("should return userStatsData", () => {
    const { userStatsData } = prepareTransaction(
      simpleTestIncome.transactionDataIn
    );
    expect(userStatsData).toStrictEqual(simpleTestIncome.userStatsDataOut);
  });
});

describe("prepareTransaction - Simple Test - Expense", () => {
  test("should return transactionData, tagData, tagStat and typeStats", () => {
    const {
      transactionData,
      tagData,
      tagStatsData,
      typeStatsData,
      userStatsData,
    } = prepareTransaction(simpleTestExpense.transactionDataIn);
    expect(transactionData).toBeDefined();
    expect(tagData).toBeDefined();
    expect(tagStatsData).toBeDefined();
    expect(typeStatsData).toBeDefined();
    expect(userStatsData).toBeDefined();
  });

  test("should return transactionData", () => {
    const { transactionData } = prepareTransaction(
      simpleTestExpense.transactionDataIn
    );
    expect(transactionData).toStrictEqual(simpleTestExpense.transactionDataOut);
  });

  test("should return tagData", () => {
    const { tagData } = prepareTransaction(simpleTestExpense.transactionDataIn);
    expect(tagData).toStrictEqual(simpleTestExpense.tagsDataOut);
  });

  test("should return tagStatsData", () => {
    const { tagStatsData } = prepareTransaction(
      simpleTestExpense.transactionDataIn
    );
    expect(tagStatsData).toStrictEqual(simpleTestExpense.tagStatsDataOut);
  });

  test("should return typeStatsData", () => {
    const { typeStatsData } = prepareTransaction(
      simpleTestExpense.transactionDataIn
    );
    expect(typeStatsData).toStrictEqual(simpleTestExpense.typeStatsDataOut);
  });

  test("should return userStatsData", () => {
    const { userStatsData } = prepareTransaction(
      simpleTestExpense.transactionDataIn
    );
    expect(userStatsData).toStrictEqual(simpleTestExpense.userStatsDataOut);
  });
});

describe("prepareTransaction - UserStats Test - Income", () => {
  test("should return calculated userStats", () => {
    const { transactionData, userStatsData } = prepareTransaction(
      userStatsSimpleIncome.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      userStatsSimpleIncome.transactionDataOut
    );
    expect(userStatsData).toStrictEqual(userStatsSimpleIncome.userStatsDataOut);
  });
});

describe("prepareTransaction - UserStats Test - Expense", () => {
  test("should return calculated userStats", () => {
    const { transactionData, userStatsData } = prepareTransaction(
      userStatsSimpleExpense.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      userStatsSimpleExpense.transactionDataOut
    );
    expect(userStatsData).toStrictEqual(
      userStatsSimpleExpense.userStatsDataOut
    );
  });
});

describe("prepareTransaction - TypeStats Test - Income", () => {
  test("should return calculated typeStats", () => {
    const { transactionData, typeStatsData } = prepareTransaction(
      typeStatsSimpleIncome.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      typeStatsSimpleIncome.transactionDataOut
    );
    expect(typeStatsData).toStrictEqual(typeStatsSimpleIncome.typeStatsDataOut);
  });
});

describe("prepareTransaction - TypeStats Test - Expense", () => {
  test("should return calculated typeStats", () => {
    const { transactionData, typeStatsData } = prepareTransaction(
      typeStatsSimpleExpense.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      typeStatsSimpleExpense.transactionDataOut
    );
    expect(typeStatsData).toStrictEqual(
      typeStatsSimpleExpense.typeStatsDataOut
    );
  });
});

describe("prepareTransaction - TagStats Test - Income", () => {
  test("should return calculated tagStats", () => {
    const { transactionData, tagStatsData } = prepareTransaction(
      tagStatsSimpleIncome.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      tagStatsSimpleIncome.transactionDataOut
    );
    expect(tagStatsData).toStrictEqual(tagStatsSimpleIncome.tagStatsDataOut);
  });

  test("should return including new tagStats", () => {
    const { transactionData, tagStatsData } = prepareTransaction(
      tagStatsNewTags.transactionDataIn
    );
    expect(transactionData).toStrictEqual(tagStatsNewTags.transactionDataOut);
    expect(tagStatsData).toStrictEqual(tagStatsNewTags.tagStatsDataOut);
  });
});

describe("prepareTransaction - TagStats Test - Expense", () => {
  test("should return calculated tagStats", () => {
    const { transactionData, tagStatsData } = prepareTransaction(
      tagStatsSimpleExpense.transactionDataIn
    );
    expect(transactionData).toStrictEqual(
      tagStatsSimpleExpense.transactionDataOut
    );
    expect(tagStatsData).toStrictEqual(tagStatsSimpleExpense.tagStatsDataOut);
  });
});
