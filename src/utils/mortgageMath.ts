import {
  LoanParams,
  CalculationResult,
  AmortizationPeriod,
  YearSummary,
  PrepaymentConfig,
  PrepaymentResult,
} from '../types/mortgage';

/**
 * Calculates single component (Commercial or Provident) amortization schedule
 */
export function calculateComponentSchedule(
  principalWan: number,
  annualRatePct: number,
  years: number,
  method: 'benxi' | 'benjin',
  startDateStr: string,
  repaidPeriodsCutoff: number = 12
): CalculationResult {
  const P = Math.max(0, principalWan) * 10000;
  const n = Math.max(1, years) * 12;
  const r = (annualRatePct / 100) / 12;

  let totalInterest = 0;
  let firstMonthly = 0;
  let monthlyDec = 0;
  const periods: AmortizationPeriod[] = [];

  const [startYearNum, startMonthNum] = startDateStr.split('-').map(Number);
  const startYear = startYearNum || 2025;
  const startMonth = startMonthNum || 4;

  if (method === 'benxi') {
    if (r === 0) {
      firstMonthly = P / n;
      totalInterest = 0;
    } else {
      firstMonthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalInterest = firstMonthly * n - P;
    }

    let remaining = P;
    for (let k = 1; k <= n; k++) {
      const interestMonth = remaining * r;
      const principalMonth = firstMonthly - interestMonth;
      remaining = Math.max(0, remaining - principalMonth);

      // Date calc
      const totalMonthsFromStart = startMonth - 1 + (k - 1);
      const currYear = startYear + Math.floor(totalMonthsFromStart / 12);
      const currMonth = (totalMonthsFromStart % 12) + 1;
      const monthPadded = String(currMonth).padStart(2, '0');
      const dateStr = `${currYear}-${monthPadded}-20`;

      const status: 'paid' | 'current' | 'future' =
        k < repaidPeriodsCutoff
          ? 'paid'
          : k === repaidPeriodsCutoff
          ? 'current'
          : 'future';

      periods.push({
        period: k,
        date: dateStr,
        year: currYear,
        month: currMonth,
        payment: firstMonthly,
        principal: principalMonth,
        interest: interestMonth,
        remainingPrincipal: remaining,
        status,
        principalRatio: firstMonthly > 0 ? principalMonth / firstMonthly : 0,
        interestRatio: firstMonthly > 0 ? interestMonth / firstMonthly : 0,
      });
    }
  } else {
    // 等额本金
    const principalMonth = P / n;
    firstMonthly = principalMonth + P * r;
    const secondMonthly = principalMonth + (P - principalMonth) * r;
    monthlyDec = firstMonthly - secondMonthly;
    totalInterest = ((n + 1) * P * r) / 2;

    let remaining = P;
    for (let k = 1; k <= n; k++) {
      const interestMonth = remaining * r;
      const paymentMonth = principalMonth + interestMonth;
      remaining = Math.max(0, remaining - principalMonth);

      const totalMonthsFromStart = startMonth - 1 + (k - 1);
      const currYear = startYear + Math.floor(totalMonthsFromStart / 12);
      const currMonth = (totalMonthsFromStart % 12) + 1;
      const monthPadded = String(currMonth).padStart(2, '0');
      const dateStr = `${currYear}-${monthPadded}-20`;

      const status: 'paid' | 'current' | 'future' =
        k < repaidPeriodsCutoff
          ? 'paid'
          : k === repaidPeriodsCutoff
          ? 'current'
          : 'future';

      periods.push({
        period: k,
        date: dateStr,
        year: currYear,
        month: currMonth,
        payment: paymentMonth,
        principal: principalMonth,
        interest: interestMonth,
        remainingPrincipal: remaining,
        status,
        principalRatio: paymentMonth > 0 ? principalMonth / paymentMonth : 0,
        interestRatio: paymentMonth > 0 ? interestMonth / paymentMonth : 0,
      });
    }
  }

  const totalRepay = P + totalInterest;
  const totalLoanWan = P / 10000;
  const totalInterestWan = totalInterest / 10000;
  const totalRepayWan = totalRepay / 10000;

  const principalRatio = totalRepayWan > 0 ? (totalLoanWan / totalRepayWan) * 100 : 0;
  const interestRatio = 100 - principalRatio;

  // Year summaries
  const yearSummaries: YearSummary[] = [];
  const yearMap = new Map<number, AmortizationPeriod[]>();
  for (const p of periods) {
    if (!yearMap.has(p.year)) {
      yearMap.set(p.year, []);
    }
    yearMap.get(p.year)!.push(p);
  }

  for (const [y, pList] of yearMap.entries()) {
    const totalP = pList.reduce((acc, curr) => acc + curr.payment, 0);
    const totalPri = pList.reduce((acc, curr) => acc + curr.principal, 0);
    const totalInt = pList.reduce((acc, curr) => acc + curr.interest, 0);
    yearSummaries.push({
      year: y,
      periodStart: pList[0].period,
      periodEnd: pList[pList.length - 1].period,
      totalPayment: totalP,
      totalPrincipal: totalPri,
      totalInterest: totalInt,
      count: pList.length,
    });
  }

  return {
    totalLoanWan,
    totalInterestWan,
    totalRepayWan,
    firstMonthlyPayment: firstMonthly,
    monthlyDecrease: monthlyDec > 0 ? monthlyDec : undefined,
    lastMonthlyPayment: periods[periods.length - 1]?.payment,
    principalRatio,
    interestRatio,
    periods,
    yearSummaries,
  };
}

/**
 * Main calculator supporting Commercial, Provident, and Combined loans
 */
export function calculateMortgage(
  params: LoanParams,
  repaidPeriodsCutoff: number = 12
): CalculationResult {
  let commWan = 0;
  let provWan = 0;

  if (params.calcBasis === 'price') {
    const totalLoan = params.homePrice * (1 - params.downPaymentRatio);
    if (params.loanType === 'commercial') {
      commWan = totalLoan;
    } else if (params.loanType === 'provident') {
      provWan = totalLoan;
    } else {
      provWan = Math.min(totalLoan, params.providentAmount);
      commWan = Math.max(0, totalLoan - provWan);
    }
  } else {
    if (params.loanType === 'commercial') {
      commWan = params.commercialAmount;
    } else if (params.loanType === 'provident') {
      provWan = params.providentAmount;
    } else {
      commWan = params.commercialAmount;
      provWan = params.providentAmount;
    }
  }

  if (params.loanType !== 'combined') {
    const isCommercial = params.loanType === 'commercial';
    const amount = isCommercial ? commWan : provWan;
    const rate = isCommercial ? params.commercialRate : params.providentRate;
    return calculateComponentSchedule(
      amount,
      rate,
      params.years,
      params.repaymentMethod,
      params.startDate,
      repaidPeriodsCutoff
    );
  }

  // Combined loan: merge commercial and provident
  const commRes = calculateComponentSchedule(
    commWan,
    params.commercialRate,
    params.years,
    params.repaymentMethod,
    params.startDate,
    repaidPeriodsCutoff
  );
  const provRes = calculateComponentSchedule(
    provWan,
    params.providentRate,
    params.years,
    params.repaymentMethod,
    params.startDate,
    repaidPeriodsCutoff
  );

  const totalLoanWan = commRes.totalLoanWan + provRes.totalLoanWan;
  const totalInterestWan = commRes.totalInterestWan + provRes.totalInterestWan;
  const totalRepayWan = commRes.totalRepayWan + provRes.totalRepayWan;

  const periods: AmortizationPeriod[] = [];
  const totalMonths = params.years * 12;

  for (let i = 0; i < totalMonths; i++) {
    const c = commRes.periods[i];
    const p = provRes.periods[i];
    const payment = (c?.payment || 0) + (p?.payment || 0);
    const principal = (c?.principal || 0) + (p?.principal || 0);
    const interest = (c?.interest || 0) + (p?.interest || 0);
    const remainingPrincipal = (c?.remainingPrincipal || 0) + (p?.remainingPrincipal || 0);

    periods.push({
      period: i + 1,
      date: c ? c.date : p?.date || '',
      year: c ? c.year : p?.year || 2025,
      month: c ? c.month : p?.month || 1,
      payment,
      principal,
      interest,
      remainingPrincipal,
      status: c?.status || 'future',
      principalRatio: payment > 0 ? principal / payment : 0,
      interestRatio: payment > 0 ? interest / payment : 0,
    });
  }

  const pRatio = totalRepayWan > 0 ? (totalLoanWan / totalRepayWan) * 100 : 0;
  const iRatio = 100 - pRatio;

  // Year summaries
  const yearSummaries: YearSummary[] = [];
  const yearMap = new Map<number, AmortizationPeriod[]>();
  for (const p of periods) {
    if (!yearMap.has(p.year)) {
      yearMap.set(p.year, []);
    }
    yearMap.get(p.year)!.push(p);
  }

  for (const [y, pList] of yearMap.entries()) {
    yearSummaries.push({
      year: y,
      periodStart: pList[0].period,
      periodEnd: pList[pList.length - 1].period,
      totalPayment: pList.reduce((acc, curr) => acc + curr.payment, 0),
      totalPrincipal: pList.reduce((acc, curr) => acc + curr.principal, 0),
      totalInterest: pList.reduce((acc, curr) => acc + curr.interest, 0),
      count: pList.length,
    });
  }

  return {
    totalLoanWan,
    totalInterestWan,
    totalRepayWan,
    firstMonthlyPayment: commRes.firstMonthlyPayment + provRes.firstMonthlyPayment,
    monthlyDecrease: (commRes.monthlyDecrease || 0) + (provRes.monthlyDecrease || 0) || undefined,
    lastMonthlyPayment: (commRes.lastMonthlyPayment || 0) + (provRes.lastMonthlyPayment || 0),
    principalRatio: pRatio,
    interestRatio: iRatio,
    periods,
    yearSummaries,
  };
}

/**
 * Calculate Prepayment benefits and adjustments
 */
export function calculatePrepayment(
  baseLoan: LoanParams,
  config: PrepaymentConfig
): PrepaymentResult {
  const originalSchedule = calculateMortgage(baseLoan, config.repaidMonths);
  const m = Math.min(config.repaidMonths, originalSchedule.periods.length - 1);
  const currentPeriod = originalSchedule.periods[m - 1] || originalSchedule.periods[0];
  const currentRemainingYuan = currentPeriod.remainingPrincipal;
  const currentRemainingWan = currentRemainingYuan / 10000;

  // Remaining periods without prepayment
  const remainingPeriodsOriginal = originalSchedule.periods.slice(m);
  const originalRemainingInterest = remainingPeriodsOriginal.reduce(
    (acc, cur) => acc + cur.interest,
    0
  );

  const prepayAmountYuan = config.mode === 'full'
    ? currentRemainingYuan
    : Math.min(config.prepayAmountWan * 10000, currentRemainingYuan - 1000);

  // Penalty calculation
  let penaltyFeeYuan = 0;
  if (config.penaltyType === 'onePercent') {
    penaltyFeeYuan = prepayAmountYuan * 0.01;
  } else if (config.penaltyType === 'threeMonths') {
    const monthlyRate = (baseLoan.commercialRate / 100) / 12;
    penaltyFeeYuan = prepayAmountYuan * monthlyRate * 3;
  }

  if (config.mode === 'full') {
    const savedInterestWan = originalRemainingInterest / 10000;
    const netSavedWan = (originalRemainingInterest - penaltyFeeYuan) / 10000;
    return {
      currentRemainingWan,
      repaidMonths: m,
      savedInterestWan,
      savedRatioPct: 100,
      penaltyFeeYuan,
      netSavedWan,
      shortenedMonths: remainingPeriodsOriginal.length,
      shortenedYearsText: `${Math.floor(remainingPeriodsOriginal.length / 12)}年${remainingPeriodsOriginal.length % 12}个月`,
      newEndDateText: '全额结清注销',
      newMonthlyPayment: 0,
      monthlyChangeText: '抵押权解押注销',
      remainingPrincipalWan: 0,
      newRemainingInterestWan: 0,
      savedInterestBarWan: savedInterestWan,
    };
  }

  // Partial Prepayment
  const newPrincipalYuan = currentRemainingYuan - prepayAmountYuan;
  const r = (baseLoan.commercialRate / 100) / 12;
  const originalMonthly = currentPeriod.payment;
  const remainingCountOriginal = remainingPeriodsOriginal.length;

  if (config.strategy === 'shorten') {
    // Keep monthly payment ~ unchanged, solve for new periods
    let newMonths = 0;
    if (r === 0) {
      newMonths = Math.ceil(newPrincipalYuan / originalMonthly);
    } else {
      const top = Math.log(1 - (newPrincipalYuan * r) / originalMonthly);
      const bottom = Math.log(1 + r);
      newMonths = Math.ceil(-top / bottom);
    }

    if (isNaN(newMonths) || newMonths <= 0 || newMonths > remainingCountOriginal) {
      newMonths = Math.max(1, Math.round(remainingCountOriginal * (newPrincipalYuan / currentRemainingYuan)));
    }

    // New interest under shorten
    const newTotalInterest = originalMonthly * newMonths - newPrincipalYuan;
    const savedInterest = Math.max(0, originalRemainingInterest - newTotalInterest);
    const shortened = Math.max(0, remainingCountOriginal - newMonths);
    const shortenedYears = Math.floor(shortened / 12);
    const shortenedMonthsMod = shortened % 12;

    const startYear = 2025 + Math.floor((m + newMonths) / 12);

    return {
      currentRemainingWan,
      repaidMonths: m,
      savedInterestWan: savedInterest / 10000,
      savedRatioPct: originalRemainingInterest > 0 ? (savedInterest / originalRemainingInterest) * 100 : 0,
      penaltyFeeYuan,
      netSavedWan: (savedInterest - penaltyFeeYuan) / 10000,
      shortenedMonths: shortened,
      shortenedYearsText: `提前 ${shortenedYears}年${shortenedMonthsMod}个月`,
      newEndDateText: `原需还款至 ${2025 + Math.floor(baseLoan.years)}年`,
      newMonthlyPayment: originalMonthly,
      monthlyChangeText: '保持原月供不变',
      remainingPrincipalWan: newPrincipalYuan / 10000,
      newRemainingInterestWan: Math.max(0, newTotalInterest / 10000),
      savedInterestBarWan: savedInterest / 10000,
    };
  } else {
    // Reduce monthly payment, keep remaining term unchanged
    const newMonths = remainingCountOriginal;
    const newMonthly =
      r === 0
        ? newPrincipalYuan / newMonths
        : (newPrincipalYuan * r * Math.pow(1 + r, newMonths)) / (Math.pow(1 + r, newMonths) - 1);
    const newTotalInterest = newMonthly * newMonths - newPrincipalYuan;
    const savedInterest = Math.max(0, originalRemainingInterest - newTotalInterest);
    const monthlyDiff = originalMonthly - newMonthly;

    return {
      currentRemainingWan,
      repaidMonths: m,
      savedInterestWan: savedInterest / 10000,
      savedRatioPct: originalRemainingInterest > 0 ? (savedInterest / originalRemainingInterest) * 100 : 0,
      penaltyFeeYuan,
      netSavedWan: (savedInterest - penaltyFeeYuan) / 10000,
      shortenedMonths: 0,
      shortenedYearsText: `保持${Math.floor(newMonths / 12)}年不变`,
      newEndDateText: `剩余${newMonths}期`,
      newMonthlyPayment: newMonthly,
      monthlyChangeText: `每月释放压力 ¥${Math.round(monthlyDiff)}`,
      remainingPrincipalWan: newPrincipalYuan / 10000,
      newRemainingInterestWan: Math.max(0, newTotalInterest / 10000),
      savedInterestBarWan: savedInterest / 10000,
    };
  }
}

/**
 * Generates CSV string for full amortization export
 */
export function generateAmortizationCSV(result: CalculationResult, loan: LoanParams): string {
  const headerLines = [
    `房贷还款计划明细表 (Amortization Schedule)`,
    `贷款类型,${loan.loanType === 'commercial' ? '商业贷款' : loan.loanType === 'provident' ? '公积金贷款' : '组合贷款'}`,
    `还款方式,${loan.repaymentMethod === 'benxi' ? '等额本息' : '等额本金'}`,
    `贷款总额,${result.totalLoanWan.toFixed(2)} 万元`,
    `支付利息,${result.totalInterestWan.toFixed(2)} 万元`,
    `还款总计,${result.totalRepayWan.toFixed(2)} 万元`,
    `贷款期限,${loan.years} 年 (${loan.years * 12} 期)`,
    `贷款利率,${loan.commercialRate}%`,
    ``,
    `期数,还款日期,月供总额(元),当期本金(元),当期利息(元),剩余本金(元),状态`,
  ];

  const rows = result.periods.map(
    (p) =>
      `${p.period},${p.date},${p.payment.toFixed(2)},${p.principal.toFixed(2)},${p.interest.toFixed(2)},${p.remainingPrincipal.toFixed(2)},${p.status === 'paid' ? '已还' : p.status === 'current' ? '待还' : '未还'}`
  );

  return '\uFEFF' + headerLines.concat(rows).join('\n');
}

/**
 * Default standard loan parameters matching screenshots
 */
export const DEFAULT_LOAN_PARAMS: LoanParams = {
  loanType: 'commercial',
  calcBasis: 'amount',
  homePrice: 150,
  downPaymentRatio: 0.3,
  commercialAmount: 100,
  commercialRate: 3.25,
  providentAmount: 60,
  providentRate: 2.85,
  years: 30,
  repaymentMethod: 'benxi',
  startDate: '2025-04',
};
