export type LoanType = 'commercial' | 'provident' | 'combined';
export type CalculationBasis = 'amount' | 'price';
export type RepaymentMethod = 'benxi' | 'benjin'; // 等额本息 | 等额本金

export interface LoanParams {
  loanType: LoanType;
  calcBasis: CalculationBasis;
  homePrice: number; // in 万
  downPaymentRatio: number; // e.g. 0.3 for 30%
  commercialAmount: number; // in 万
  commercialRate: number; // in %
  providentAmount: number; // in 万
  providentRate: number; // in %
  years: number; // in years (e.g. 30)
  repaymentMethod: RepaymentMethod;
  startDate: string; // YYYY-MM
}

export interface AmortizationPeriod {
  period: number; // 1 to 360
  date: string; // YYYY-MM-DD
  year: number;
  month: number;
  payment: number; // Monthly payment in 元
  principal: number; // 当期本金 in 元
  interest: number; // 当期利息 in 元
  remainingPrincipal: number; // 剩余待还本金 in 元
  status: 'paid' | 'current' | 'future';
  principalRatio: number; // 0 - 1
  interestRatio: number; // 0 - 1
}

export interface YearSummary {
  year: number;
  periodStart: number;
  periodEnd: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  count: number;
}

export interface CalculationResult {
  totalLoanWan: number;
  totalInterestWan: number;
  totalRepayWan: number;
  firstMonthlyPayment: number; // 首月月供
  monthlyDecrease?: number; // 每月递减 (等额本金)
  lastMonthlyPayment?: number;
  interestRatio: number; // %
  principalRatio: number; // %
  periods: AmortizationPeriod[];
  yearSummaries: YearSummary[];
}

export interface PrepaymentConfig {
  mode: 'partial' | 'full'; // 部分提前还款 | 一次性全部结清
  prepayAmountWan: number; // 拟提前偿还本金 (万)
  strategy: 'shorten' | 'reducePayment'; // 缩短年限 | 减少月供
  penaltyType: 'none' | 'onePercent' | 'threeMonths';
  repaidMonths: number; // 已还期数 (例如 36 期 = 3年)
}

export interface PrepaymentResult {
  currentRemainingWan: number;
  repaidMonths: number;
  savedInterestWan: number;
  savedRatioPct: number;
  penaltyFeeYuan: number;
  netSavedWan: number;
  // Strategy Shorten
  shortenedMonths: number;
  shortenedYearsText: string;
  newEndDateText: string;
  newMonthlyPayment: number;
  monthlyChangeText: string;
  // Visual Bar
  remainingPrincipalWan: number;
  newRemainingInterestWan: number;
  savedInterestBarWan: number;
}
