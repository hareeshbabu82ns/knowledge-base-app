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
  interestRate: number;
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
  paymentFrequency: "monthly" | "biweekly";
  startDate: Date;
  extraPayments: ExtraPayment[];
  interestRateChanges: InterestRateChange[];
  emiPaid?: number;
}): { schedule: PaymentSchedule[]; scheduleYear: PaymentScheduleYear[] } {
  // const endTermDate = addMonths(startDate, loanTermMonths);
  // const totalWeeks = differenceInCalendarWeeks(endTermDate, startDate);
  // const loanTermBiWeeks = Math.ceil(totalWeeks / 2);
  const totalPayments =
    paymentFrequency === "monthly"
      ? loanTermMonths
      : Math.ceil((loanTermMonths / 12) * 26);

  let interestRate =
    paymentFrequency === "monthly"
      ? annualInterestRate / 12 / 100
      : annualInterestRate / 26 / 100;

  const paymentSchedule: PaymentSchedule[] = [];
  const paymentScheduleYear: Record<string, PaymentScheduleYear> = {};

  let remainingBalance = principal;
  let currentDate = new Date(startDate);
  let endDate =
    paymentFrequency === "monthly"
      ? addMonths(currentDate, 1)
      : addWeeks(currentDate, 2);

  const emi =
    emiPaid ||
    (remainingBalance *
      interestRate *
      Math.pow(1 + interestRate, totalPayments)) /
      (Math.pow(1 + interestRate, totalPayments) - 1);

  for (let i = 1; remainingBalance > 0.0; i++) {
    // for (let i = 1; i <= totalPayments; i++) {
    const scheduleYear = paymentScheduleYear[
      currentDate.getFullYear().toString()
    ] || {
      paymentNumber: 0,
      paymentAmount: 0,
      principalPaid: 0,
      interestPaid: 0,
      remainingBalance: 0,
      year: currentDate.getFullYear(),
    };

    // Check for interest rate changes
    const rateChange = interestRateChanges.find(
      (change) => change.date <= currentDate,
    );
    if (rateChange) {
      interestRate =
        paymentFrequency === "monthly"
          ? rateChange.interestRate / 12 / 100
          : rateChange.interestRate / 26 / 100;
    }

    // Calculate EMI
    // const emi =
    //   (remainingBalance *
    //     interestRate *
    //     Math.pow(1 + interestRate, totalPayments - i + 1)) /
    //   (Math.pow(1 + interestRate, totalPayments - i + 1) - 1);

    // if (emi < 0.0) {
    //   break;
    // }

    // Check for extra payments
    const extraPayment = extraPayments.find(
      (payment) => payment.date >= currentDate && payment.date <= endDate,
    );

    const extraPaymentAmount = extraPayment ? extraPayment.amount : 0;
    // remainingBalance -= extraPayment.amount;

    const interestPaid = remainingBalance * interestRate;
    const principalPaid = emi - interestPaid + extraPaymentAmount;
    remainingBalance -= principalPaid;
    remainingBalance = remainingBalance < 0.0 ? 0 : remainingBalance;

    paymentSchedule.push({
      paymentNumber: i,
      paymentAmount: emi + extraPaymentAmount,
      principalPaid: principalPaid,
      interestPaid: interestPaid,
      remainingBalance: remainingBalance,
      paymentDate: new Date(currentDate),
    });

    scheduleYear.paymentNumber = i;
    scheduleYear.paymentAmount += emi + extraPaymentAmount;
    scheduleYear.principalPaid += principalPaid;
    scheduleYear.interestPaid += interestPaid;
    scheduleYear.remainingBalance = remainingBalance;
    paymentScheduleYear[currentDate.getFullYear().toString()] = scheduleYear;

    if (remainingBalance <= 0.0) break;

    // Update the current date for the next payment
    currentDate = endDate;
    endDate =
      paymentFrequency === "monthly"
        ? addMonths(currentDate, 1)
        : addWeeks(currentDate, 2);
    // if (paymentFrequency === "monthly") {
    //   currentDate.setMonth(currentDate.getMonth() + 1);
    // } else {
    //   currentDate.setDate(currentDate.getDate() + 14);
    // }
  }

  return {
    schedule: paymentSchedule,
    scheduleYear: Object.values(paymentScheduleYear),
  };
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
const paymentFrequency = "monthly"; // Payment frequency: "monthly" or "biweekly"
const startDate = new Date("2023-01-01"); // Start date of the loan

const extraPayments: ExtraPayment[] = [
  { date: new Date("2024-01-01"), amount: 5000 },
  { date: new Date("2025-01-01"), amount: 10000 },
];

const interestRateChanges: InterestRateChange[] = [
  { date: new Date("2026-01-01"), interestRate: 4.5 },
  { date: new Date("2027-01-01"), interestRate: 4.0 },
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
    { date: new Date("2024-01-01"), amount: 5000 },
    { date: new Date("2025-01-01"), amount: 10000 },
  ];

  const interestRateChanges: InterestRateChange[] = [
    { date: new Date("2026-01-01"), interestRate: 4.5 },
    { date: new Date("2027-01-01"), interestRate: 4.0 },
  ];

  const schedule = calculateEMISplits({
    principal: 300000,
    annualInterestRate: 5,
    loanTermMonths: 25 * 12,
    paymentFrequency: "biweekly",
    startDate: new Date("2020-01-02"),
    extraPayments: withExtraPayments ? extraPayments : [],
    interestRateChanges,
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
  paymentFrequency: "monthly" | "biweekly";
}): number {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const biweeklyInterestRate = annualInterestRate / 26 / 100;
  const totalPayments =
    paymentFrequency === "monthly"
      ? loanTermMonths
      : Math.ceil((loanTermMonths / 12) * 26);
  const interestRate =
    paymentFrequency === "monthly" ? monthlyInterestRate : biweeklyInterestRate;

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
const paymentFrequency = "monthly"; // Payment frequency: "monthly" or "biweekly"

const emi = calculateEMI({
  principal,
  annualInterestRate,
  loanTermMonths,
  paymentFrequency,
});
console.log(`The EMI is: ${emi.toFixed(2)}`);
*/
