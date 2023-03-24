export const tagStatsSimpleExpense = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Expense",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
    tagStats: [
      {
        _id: "tagStatsId_test",
        userId: "userId",
        tag: "test",
        year: 2023,
        yearlyTotal: 630,
        monthlyData: [
          {
            month: 1,
            total: 30,
          },
          {
            month: 3,
            total: 100,
          },
          {
            month: 8,
            total: 500,
          },
        ],
        dailyData: [
          {
            date: 3,
            total: 500,
          },
          {
            date: 21,
            total: 50,
          },
          {
            date: 28,
            total: 80,
          },
        ],
      },
      {
        _id: "tagStatsId_sample",
        userId: "userId",
        tag: "sample",
        year: 2023,
        yearlyTotal: 100,
        monthlyData: [
          {
            month: 3,
            total: 100,
          },
        ],
        dailyData: [
          {
            date: 5,
            total: 50,
          },
          {
            date: 21,
            total: 50,
          },
        ],
      },
    ],
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Expense",
    tags: ["test", "sample"],
  },
  tagStatsDataOut: [
    {
      _id: "tagStatsId_test",
      userId: "userId",
      tag: "test",
      year: 2023,
      yearlyTotal: 530,
      monthlyData: [
        {
          month: 1,
          total: 30,
        },
        {
          month: 3,
          total: 0,
        },
        {
          month: 8,
          total: 500,
        },
      ],
      dailyData: [
        {
          date: 3,
          total: 500,
        },
        {
          date: 21,
          total: -50,
        },
        {
          date: 28,
          total: 80,
        },
      ],
    },
    {
      _id: "tagStatsId_sample",
      userId: "userId",
      tag: "sample",
      year: 2023,
      yearlyTotal: 0,
      monthlyData: [
        {
          month: 3,
          total: 0,
        },
      ],
      dailyData: [
        {
          date: 5,
          total: 50,
        },
        {
          date: 21,
          total: -50,
        },
      ],
    },
  ],
};

export const tagStatsSimpleIncome = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Income",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
    tagStats: [
      {
        _id: "tagStatsId_test",
        userId: "userId",
        tag: "test",
        year: 2023,
        yearlyTotal: 630,
        monthlyData: [
          {
            month: 1,
            total: 30,
          },
          {
            month: 3,
            total: 100,
          },
          {
            month: 8,
            total: 500,
          },
        ],
        dailyData: [
          {
            date: 3,
            total: 500,
          },
          {
            date: 21,
            total: 50,
          },
          {
            date: 28,
            total: 80,
          },
        ],
      },
      {
        _id: "tagStatsId_sample",
        userId: "userId",
        tag: "sample",
        year: 2023,
        yearlyTotal: 100,
        monthlyData: [
          {
            month: 3,
            total: 100,
          },
        ],
        dailyData: [
          {
            date: 5,
            total: 50,
          },
          {
            date: 21,
            total: 50,
          },
        ],
      },
    ],
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Income",
    tags: ["test", "sample"],
  },
  tagStatsDataOut: [
    {
      _id: "tagStatsId_test",
      userId: "userId",
      tag: "test",
      year: 2023,
      yearlyTotal: 730,
      monthlyData: [
        {
          month: 1,
          total: 30,
        },
        {
          month: 3,
          total: 200,
        },
        {
          month: 8,
          total: 500,
        },
      ],
      dailyData: [
        {
          date: 3,
          total: 500,
        },
        {
          date: 21,
          total: 150,
        },
        {
          date: 28,
          total: 80,
        },
      ],
    },
    {
      _id: "tagStatsId_sample",
      userId: "userId",
      tag: "sample",
      year: 2023,
      yearlyTotal: 200,
      monthlyData: [
        {
          month: 3,
          total: 200,
        },
      ],
      dailyData: [
        {
          date: 5,
          total: 50,
        },
        {
          date: 21,
          total: 150,
        },
      ],
    },
  ],
};

export const tagStatsNewTags = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Income",
      tags: ["test", "newTag"],
    },
    user: {
      _id: "userId",
    },
    tagStats: [
      {
        _id: "tagStatsId_test",
        userId: "userId",
        tag: "test",
        year: 2023,
        yearlyTotal: 100,
        monthlyData: [
          {
            month: 3,
            total: 100,
          },
        ],
        dailyData: [
          {
            date: 5,
            total: 50,
          },
          {
            date: 21,
            total: 50,
          },
        ],
      },
    ],
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Income",
    tags: ["test", "newTag"],
  },
  tagStatsDataOut: [
    {
      _id: "tagStatsId_test",
      userId: "userId",
      tag: "test",
      year: 2023,
      yearlyTotal: 200,
      monthlyData: [
        {
          month: 3,
          total: 200,
        },
      ],
      dailyData: [
        {
          date: 5,
          total: 50,
        },
        {
          date: 21,
          total: 150,
        },
      ],
    },
    {
      userId: "userId",
      tag: "newTag",
      year: 2023,
      yearlyTotal: 100,
      monthlyData: [
        {
          month: 3,
          total: 100,
        },
      ],
      dailyData: [
        {
          date: 21,
          total: 100,
        },
      ],
    },
  ],
};

export const typeStatsSimpleExpense = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Expense",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
    typeStats: {
      _id: "typeStats",
      userId: "userId",
      type: "Expense",
      year: 2023,
      yearlyTotal: 300,
      monthlyData: [
        {
          month: 1,
          total: 150,
        },
        {
          month: 3,
          total: 150,
        },
      ],
      dailyData: [
        {
          date: 5,
          total: 30,
        },
        {
          date: 21,
          total: 150,
        },
        {
          date: 28,
          total: 120,
        },
      ],
    },
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Expense",
    tags: ["test", "sample"],
  },
  typeStatsDataOut: {
    _id: "typeStats",
    userId: "userId",
    type: "Expense",
    year: 2023,
    yearlyTotal: 400,
    monthlyData: [
      {
        month: 1,
        total: 150,
      },
      {
        month: 3,
        total: 250,
      },
    ],
    dailyData: [
      {
        date: 5,
        total: 30,
      },
      {
        date: 21,
        total: 250,
      },
      {
        date: 28,
        total: 120,
      },
    ],
  },
};

export const typeStatsSimpleIncome = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Income",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
    typeStats: {
      _id: "typeStats",
      userId: "userId",
      type: "Income",
      year: 2023,
      yearlyTotal: 200,
      monthlyData: [
        {
          month: 1,
          total: 150,
        },
        {
          month: 3,
          total: 50,
        },
      ],
      dailyData: [
        {
          date: 5,
          total: 30,
        },
        {
          date: 21,
          total: 50,
        },
        {
          date: 28,
          total: 120,
        },
      ],
    },
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Income",
    tags: ["test", "sample"],
  },
  typeStatsDataOut: {
    _id: "typeStats",
    userId: "userId",
    type: "Income",
    year: 2023,
    yearlyTotal: 300,
    monthlyData: [
      {
        month: 1,
        total: 150,
      },
      {
        month: 3,
        total: 150,
      },
    ],
    dailyData: [
      {
        date: 5,
        total: 30,
      },
      {
        date: 21,
        total: 150,
      },
      {
        date: 28,
        total: 120,
      },
    ],
  },
};

export const simpleTestExpense = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Expense",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Expense",
    tags: ["test", "sample"],
  },
  tagsDataOut: [
    {
      userId: "userId",
      tag: "test",
    },
    {
      userId: "userId",
      tag: "sample",
    },
  ],
  tagStatsDataOut: [
    {
      userId: "userId",
      tag: "test",
      year: 2023,
      yearlyTotal: -100,
      monthlyData: [
        {
          month: 3,
          total: -100,
        },
      ],
      dailyData: [
        {
          date: 21,
          total: -100,
        },
      ],
    },
    {
      userId: "userId",
      tag: "sample",
      year: 2023,
      yearlyTotal: -100,
      monthlyData: [
        {
          month: 3,
          total: -100,
        },
      ],
      dailyData: [
        {
          date: 21,
          total: -100,
        },
      ],
    },
  ],
  typeStatsDataOut: {
    userId: "userId",
    type: "Expense",
    year: 2023,
    yearlyTotal: 100,
    monthlyData: [
      {
        month: 3,
        total: 100,
      },
    ],
    dailyData: [
      {
        date: 21,
        total: 100,
      },
    ],
  },
};

export const simpleTestIncome = {
  transactionDataIn: {
    transaction: {
      amount: 100,
      date: "2023-03-21T23:30:00.938-06:00", // UTC date saves will go to 2023-03-22T05
      type: "Income",
      tags: ["test", "sample"],
    },
    user: {
      _id: "userId",
    },
  },
  transactionDataOut: {
    userId: "userId",
    amount: 100,
    date: "2023-03-21T23:30:00.938-06:00",
    dateZ: "2023-03-21T23:30:00.938-06:00",
    type: "Income",
    tags: ["test", "sample"],
  },
  tagsDataOut: [
    {
      userId: "userId",
      tag: "test",
    },
    {
      userId: "userId",
      tag: "sample",
    },
  ],
  tagStatsDataOut: [
    {
      userId: "userId",
      tag: "test",
      year: 2023,
      yearlyTotal: 100,
      monthlyData: [
        {
          month: 3,
          total: 100,
        },
      ],
      dailyData: [
        {
          date: 21,
          total: 100,
        },
      ],
    },
    {
      userId: "userId",
      tag: "sample",
      year: 2023,
      yearlyTotal: 100,
      monthlyData: [
        {
          month: 3,
          total: 100,
        },
      ],
      dailyData: [
        {
          date: 21,
          total: 100,
        },
      ],
    },
  ],
  typeStatsDataOut: {
    userId: "userId",
    type: "Income",
    year: 2023,
    yearlyTotal: 100,
    monthlyData: [
      {
        month: 3,
        total: 100,
      },
    ],
    dailyData: [
      {
        date: 21,
        total: 100,
      },
    ],
  },
};
