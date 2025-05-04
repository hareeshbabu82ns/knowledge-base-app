import { addMonths, addWeeks } from "date-fns";

export type PaymentSchedule = {
  paymentNumber: number;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  paymentDate: Date;
};

export type PaymentScheduleYear = {
  paymentNumber: number;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  year: number;
};

export type ExtraPayment = {
  date: Date;
  amount: number;
};

export type InterestRateChange = {
  date: Date;
  rate: number;
};

export function calculateEMISplits({
  principal,
  annualInterestRate,
  loanTermMonths,
  paymentFrequency,
  startDate,
  extraPayments = [],
  interestRateChanges = [],
  emiPaid,
}: {
  principal: number;
  annualInterestRate: number;
  loanTermMonths: number;
  paymentFrequency: "MONTHLY" | "BIWEEKLY";
  startDate: Date;
  extraPayments: ExtraPayment[];
  interestRateChanges: InterestRateChange[];
  emiPaid?: number;
}): { schedule: PaymentSchedule[]; scheduleYear: PaymentScheduleYear[] } {
  const totalPayments =
    paymentFrequency === "MONTHLY"
      ? loanTermMonths
      : Math.ceil((loanTermMonths / 12) * 26);

  // Sort extra payments and interest rate changes by date for proper processing
  const sortedExtraPayments = [...extraPayments].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const sortedInterestRateChanges = [...interestRateChanges].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  // Initialize with starting interest rate
  let currentInterestRate = annualInterestRate;
  let interestRate =
    paymentFrequency === "MONTHLY"
      ? currentInterestRate / 12 / 100
      : currentInterestRate / 26 / 100;

  const paymentSchedule: PaymentSchedule[] = [];
  const paymentScheduleYear: Record<string, PaymentScheduleYear> = {};

  let remainingBalance = principal;
  let currentDate = new Date(startDate);

  // Calculate initial EMI
  let emi =
    emiPaid ||
    calculateInitialEMI(remainingBalance, interestRate, totalPayments);

  let paymentNumber = 1;
  let remainingPayments = totalPayments;

  // Continue until the loan is fully paid off
  while (remainingBalance > 0.01) {
    // Get year for the current payment for annual aggregation
    const year = currentDate.getFullYear();
    const yearKey = year.toString();

    // Initialize or get the year summary object
    const scheduleYear = paymentScheduleYear[yearKey] || {
      paymentNumber: 0,
      paymentAmount: 0,
      principalPaid: 0,
      interestPaid: 0,
      remainingBalance: 0,
      year: year,
    };

    // Calculate end date for this payment period
    const endDate =
      paymentFrequency === "MONTHLY"
        ? addMonths(currentDate, 1)
        : addWeeks(currentDate, 2);

    // Check for interest rate changes that would apply to this payment
    // Find rate changes that occurred before or on the current payment date
    // but after the previous payment date (or since loan start for first payment)
    const applicableRateChanges = sortedInterestRateChanges.filter((change) => {
      // For the current payment period, we only want changes that:
      // 1. Are on or before the current payment date (to affect this payment)
      // 2. Are strictly after the previous payment date
      //    (or after loan start date for first payment)
      const previousPaymentDate =
        paymentNumber === 1
          ? new Date(startDate.getTime() - 1) // Just before loan start
          : paymentSchedule[paymentNumber - 2].paymentDate;

      return (
        change.date.getTime() <= currentDate.getTime() &&
        change.date.getTime() > previousPaymentDate.getTime()
      );
    });

    if (applicableRateChanges.length > 0) {
      // Apply the latest applicable interest rate change
      const latestRateChange =
        applicableRateChanges[applicableRateChanges.length - 1];
      currentInterestRate = latestRateChange.rate;
      interestRate =
        paymentFrequency === "MONTHLY"
          ? currentInterestRate / 12 / 100
          : currentInterestRate / 26 / 100;

      // Recalculate EMI based on new rate if not using a fixed payment amount
      if (!emiPaid) {
        emi = calculateInitialEMI(
          remainingBalance,
          interestRate,
          remainingPayments,
        );
      }
    }

    // Calculate interest for this payment
    const interestPaid = remainingBalance * interestRate;

    // Regular principal payment
    let principalPaid = emi - interestPaid;
    let paymentAmount = emi;

    // Check for extra payments that fall within this payment period
    const applicableExtraPayments = sortedExtraPayments.filter(
      (payment) => payment.date >= currentDate && payment.date < endDate,
    );

    let extraPaymentAmount = 0;
    if (applicableExtraPayments.length > 0) {
      // Sum all applicable extra payments
      extraPaymentAmount = applicableExtraPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      principalPaid += extraPaymentAmount;
      paymentAmount += extraPaymentAmount;
    }

    // Calculate new remaining balance
    remainingBalance -= principalPaid;

    // Ensure remainingBalance doesn't go below zero
    if (remainingBalance < 0) {
      // Adjust principal paid to match the actual remaining balance
      principalPaid += remainingBalance; // This will make principalPaid smaller
      paymentAmount = interestPaid + principalPaid;
      remainingBalance = 0;
    }

    // Add to payment schedule
    paymentSchedule.push({
      paymentNumber,
      paymentAmount,
      principalPaid,
      interestPaid,
      remainingBalance,
      paymentDate: new Date(currentDate),
    });

    // Update yearly summary
    scheduleYear.paymentNumber = paymentNumber;
    scheduleYear.paymentAmount += paymentAmount;
    scheduleYear.principalPaid += principalPaid;
    scheduleYear.interestPaid += interestPaid;
    scheduleYear.remainingBalance = remainingBalance;
    paymentScheduleYear[yearKey] = scheduleYear;

    // Break if loan is fully paid
    if (remainingBalance <= 0) break;

    // Move to next payment period
    currentDate = endDate;
    paymentNumber++;
    remainingPayments--;
  }

  return {
    schedule: paymentSchedule,
    scheduleYear: Object.values(paymentScheduleYear),
  };
}

// Helper function to calculate initial EMI based on remaining balance, interest rate and payments
function calculateInitialEMI(
  principal: number,
  periodicInterestRate: number,
  totalPayments: number,
): number {
  return (
    (principal *
      periodicInterestRate *
      Math.pow(1 + periodicInterestRate, totalPayments)) /
    (Math.pow(1 + periodicInterestRate, totalPayments) - 1)
  );
}

export function calculateStats(schedule: PaymentScheduleYear[]) {
  const totalPaid = schedule.reduce((acc, item) => acc + item.paymentAmount, 0);
  const totalPrincipalPaid = schedule.reduce(
    (acc, item) => acc + item.principalPaid,
    0,
  );
  const totalInterestPaid = schedule.reduce(
    (acc, item) => acc + item.interestPaid,
    0,
  );

  return {
    totalPaid: Math.round(totalPaid),
    totalPrincipalPaid: Math.round(totalPrincipalPaid),
    totalInterestPaid: Math.round(totalInterestPaid),
  };
}

/*
// Example usage
const principal = 300000; // Mortgage amount
const annualInterestRate = 5; // Annual interest rate in percentage
const loanTermMonths = 360; // Loan term in months (30 years)
const paymentFrequency = "MONTHLY"; // Payment frequency: "MONTHLY" or "BIWEEKLY"
const startDate = new Date("2023-01-01"); // Start date of the loan

const extraPayments: ExtraPayment[] = [
  { date: new Date("2024-01-01"), amount: 5000 },
  { date: new Date("2025-01-01"), amount: 10000 },
];

const interestRateChanges: InterestRateChange[] = [
  { date: new Date("2026-01-01"), rate: 4.5 },
  { date: new Date("2027-01-01"), rate: 4.0 },
];

const schedule = calculateEMI(
  principal,
  annualInterestRate,
  loanTermMonths,
  paymentFrequency,
  startDate,
  extraPayments,
  interestRateChanges,
);
console.log(schedule);
*/

export function sampleEMISplits({
  withExtraPayments = true,
}: { withExtraPayments?: boolean } = {}): {
  schedule: PaymentSchedule[];
  scheduleYear: PaymentScheduleYear[];
} {
  const extraPayments: ExtraPayment[] = [
    { date: new Date("2022-06-24"), amount: 20000 },
    { date: new Date("2022-08-05"), amount: 12000 },
    { date: new Date("2024-05-11"), amount: 10000 },
    { date: new Date("2024-07-05"), amount: 20000 },
    { date: new Date("2024-09-05"), amount: 20000 },
    { date: new Date("2025-04-05"), amount: 20000 },
    { date: new Date("2025-09-05"), amount: 20000 },
    { date: new Date("2026-04-05"), amount: 20000 },
    { date: new Date("2026-09-05"), amount: 20000 },
  ];

  const interestRateChanges: InterestRateChange[] = [
    { date: new Date("2027-03-02"), rate: 4.5 },
  ];

  const schedule = calculateEMISplits({
    principal: 365000,
    annualInterestRate: 1.49,
    loanTermMonths: 25 * 12,
    paymentFrequency: "BIWEEKLY",
    startDate: new Date("2022-03-04"),
    extraPayments: withExtraPayments ? extraPayments : [],
    interestRateChanges,
    emiPaid: 672.45,
  });
  return schedule;
}

export function calculateEMI({
  principal,
  annualInterestRate,
  loanTermMonths,
  paymentFrequency,
}: {
  principal: number;
  annualInterestRate: number;
  loanTermMonths: number;
  paymentFrequency: "MONTHLY" | "BIWEEKLY";
}): number {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const biweeklyInterestRate = annualInterestRate / 26 / 100;
  const totalPayments =
    paymentFrequency === "MONTHLY"
      ? loanTermMonths
      : Math.ceil((loanTermMonths / 12) * 26);
  const interestRate =
    paymentFrequency === "MONTHLY" ? monthlyInterestRate : biweeklyInterestRate;

  // Calculate EMI
  const emi =
    (principal * interestRate * Math.pow(1 + interestRate, totalPayments)) /
    (Math.pow(1 + interestRate, totalPayments) - 1);

  return emi;
}

/*
// Example usage
const principal = 300000; // Mortgage amount
const annualInterestRate = 5; // Annual interest rate in percentage
const loanTermMonths = 360; // Loan term in months (30 years)
const paymentFrequency = "MONTHLY"; // Payment frequency: "MONTHLY" or "BIWEEKLY"

const emi = calculateEMI({
  principal,
  annualInterestRate,
  loanTermMonths,
  paymentFrequency,
});
console.log(`The EMI is: ${emi.toFixed(2)}`);
*/
