import React from 'react';
import { LoanParams, CalculationResult } from '../../types/mortgage';

interface CalculatorScreenProps {
  params: LoanParams;
  setParams: React.Dispatch<React.SetStateAction<LoanParams>>;
  result: CalculationResult;
  onNavigateToSchedule: () => void;
  onNavigateToComparison: () => void;
  onNavigateToEarlyRepayment: () => void;
}

const BASE_LPR = 3.45;

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  params,
  setParams,
  result,
  onNavigateToSchedule,
  onNavigateToComparison,
  onNavigateToEarlyRepayment,
}) => {
  // Calculated difference if compared to benjin
  const diffInterestWan = Math.abs(56.67 - 48.88); // reference or dynamic

  const handleAmountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(2000, val));
    if (params.loanType === 'provident') {
      setParams((prev) => ({ ...prev, providentAmount: clamped }));
    } else {
      setParams((prev) => ({ ...prev, commercialAmount: clamped }));
    }
  };

  const handleBpPreset = (bp: number) => {
    const newRate = +(BASE_LPR + bp / 100).toFixed(2);
    setParams((prev) => ({ ...prev, commercialRate: newRate }));
  };

  const currentBp = Math.round((params.commercialRate - BASE_LPR) * 100);

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* Top Segmented: Loan Type */}
      <div className="p-1 rounded-xl bg-surface-container flex items-center justify-between shadow-sm">
        <button
          className={`loan-type-btn flex-1 py-2 text-center rounded-lg font-headline-sm text-headline-sm transition-all duration-200 cursor-pointer ${
            params.loanType === 'commercial'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setParams((p) => ({ ...p, loanType: 'commercial' }))}
          type="button"
        >
          商业贷款
        </button>
        <button
          className={`loan-type-btn flex-1 py-2 text-center rounded-lg font-headline-sm text-headline-sm transition-all duration-200 cursor-pointer ${
            params.loanType === 'provident'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setParams((p) => ({ ...p, loanType: 'provident' }))}
          type="button"
        >
          公积金贷款
        </button>
        <button
          className={`loan-type-btn flex-1 py-2 text-center rounded-lg font-headline-sm text-headline-sm transition-all duration-200 cursor-pointer ${
            params.loanType === 'combined'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setParams((p) => ({ ...p, loanType: 'combined' }))}
          type="button"
        >
          组合贷款
        </button>
      </div>

      {/* Computation Basis Switcher */}
      <div className="flex items-center justify-between px-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">计算基准</span>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-full">
          <button
            className={`px-3 py-1 rounded-full font-label-caps text-label-caps transition-colors cursor-pointer ${
              params.calcBasis === 'amount'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setParams((p) => ({ ...p, calcBasis: 'amount' }))}
            type="button"
          >
            按贷款额度
          </button>
          <button
            className={`px-3 py-1 rounded-full font-label-caps text-label-caps transition-colors cursor-pointer ${
              params.calcBasis === 'price'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setParams((p) => ({ ...p, calcBasis: 'price' }))}
            type="button"
          >
            按房屋总价
          </button>
        </div>
      </div>

      {/* Realtime Calculation Highlight Banner */}
      <div className="rounded-xl p-space-md bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 opacity-90 mb-1">
              <span className="font-label-caps text-label-caps tracking-wider uppercase">预计月供参考</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-on-primary backdrop-blur-sm">
                {params.repaymentMethod === 'benxi' ? '等额本息' : '等额本金'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold">¥</span>
              <span className="font-display-hero-mobile text-display-hero-mobile tracking-tight font-bold">
                {result.firstMonthlyPayment.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="font-body-sm text-body-sm opacity-80">/月</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-primary/80 mt-1 flex items-center gap-1">
              {params.repaymentMethod === 'benxi' ? (
                <>
                  <span className="material-symbols-outlined text-[15px]">trending_down</span>
                  <span>每月本息相同，前期还款压力均匀</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                  <span>
                    首月最高，次月起预计每月递减约 ¥{result.monthlyDecrease?.toFixed(1) || '8.5'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px] text-secondary-fixed">shield_lock</span>
          </div>
        </div>

        {/* Proportion Bar & Micro Metrics */}
        <div className="mt-space-md pt-space-sm border-t border-white/15 relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between font-label-caps text-label-caps text-on-primary/90">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed inline-block"></span>
              本金 ¥{result.totalLoanWan.toFixed(2)}万 ({result.principalRatio.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block"></span>
              利息 ¥{result.totalInterestWan.toFixed(2)}万 ({result.interestRatio.toFixed(1)}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden flex">
            <div
              className="h-full bg-secondary-fixed transition-all duration-300"
              style={{ width: `${result.principalRatio}%` }}
            ></div>
            <div
              className="h-full bg-amber-300 transition-all duration-300"
              style={{ width: `${result.interestRatio}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 text-center bg-black/10 rounded-lg p-2 backdrop-blur-sm">
            <div>
              <span className="block font-label-caps text-label-caps text-on-primary/75">贷款总额</span>
              <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight font-semibold">
                {result.totalLoanWan.toFixed(2)}万
              </span>
            </div>
            <div>
              <span className="block font-label-caps text-label-caps text-on-primary/75">支付利息</span>
              <span className="font-headline-sm text-headline-sm text-amber-300 tracking-tight font-semibold">
                {result.totalInterestWan.toFixed(2)}万
              </span>
            </div>
            <div>
              <span className="block font-label-caps text-label-caps text-on-primary/75">还款总计</span>
              <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight font-semibold">
                {result.totalRepayWan.toFixed(2)}万
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Form Module Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        {/* If Mode is Price Basis, show Home Price & Down Payment */}
        {params.calcBasis === 'price' && (
          <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-headline-sm text-headline-sm text-on-surface">房屋总价</label>
              <div className="flex items-baseline gap-1">
                <span className="text-on-surface-variant font-semibold">¥</span>
                <input
                  type="number"
                  value={params.homePrice}
                  onChange={(e) => setParams((p) => ({ ...p, homePrice: Number(e.target.value) || 0 }))}
                  className="w-20 bg-transparent font-headline-md text-headline-md text-primary font-bold focus:outline-none text-right"
                  min="20"
                  max="5000"
                />
                <span className="text-body-sm text-on-surface font-medium">万元</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-surface-container">
              <span className="font-body-sm text-body-sm text-on-surface-variant">首付比例</span>
              <div className="flex gap-1.5">
                {[0.2, 0.3, 0.4, 0.5].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, downPaymentRatio: ratio }))}
                    className={`px-2.5 py-1 rounded text-body-sm font-body-sm cursor-pointer transition-all ${
                      params.downPaymentRatio === ratio
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {Math.round(ratio * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Row 1: Loan Amount (with slider & stepper) */}
        {params.loanType !== 'provident' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-headline-sm text-headline-sm text-on-surface">
                {params.loanType === 'combined' ? '商业贷款金额' : '贷款金额'}
              </label>
              <span className="font-body-sm text-body-sm text-on-surface-variant">单位：万元</span>
            </div>
            <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2.5 rounded-lg">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">¥</span>
                <input
                  type="number"
                  value={params.commercialAmount}
                  onChange={(e) => handleAmountChange(Number(e.target.value) || 0)}
                  className="w-28 bg-transparent font-metric-large text-metric-large text-primary font-bold focus:outline-none"
                  min="5"
                  max="2000"
                  step="1"
                />
                <span className="font-headline-sm text-headline-sm text-on-surface">万元</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAmountChange(params.commercialAmount - 5)}
                  className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAmountChange(params.commercialAmount + 5)}
                  className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            <div className="pt-1 px-1">
              <input
                type="range"
                value={Math.min(params.commercialAmount, 800)}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                min="10"
                max="800"
                step="5"
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant/70 mt-1">
                <span>10万</span>
                <span>200万</span>
                <span>400万</span>
                <span>800万</span>
              </div>
            </div>
          </div>
        )}

        {/* If Combined or Provident, show Provident Amount */}
        {(params.loanType === 'provident' || params.loanType === 'combined') && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-headline-sm text-headline-sm text-on-surface">公积金贷款金额</label>
              <span className="font-body-sm text-body-sm text-on-surface-variant">单位：万元</span>
            </div>
            <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2.5 rounded-lg">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">¥</span>
                <input
                  type="number"
                  value={params.providentAmount}
                  onChange={(e) => setParams((p) => ({ ...p, providentAmount: Number(e.target.value) || 0 }))}
                  className="w-28 bg-transparent font-metric-large text-metric-large text-primary font-bold focus:outline-none"
                  min="5"
                  max="120"
                  step="5"
                />
                <span className="font-headline-sm text-headline-sm text-on-surface">万元</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, providentAmount: Math.max(5, p.providentAmount - 5) }))}
                  className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, providentAmount: p.providentAmount + 5 }))}
                  className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Loan Term Capsule Selectors */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">按揭年限</span>
            <span className="font-body-sm text-body-sm text-primary font-semibold">
              {params.years}年 ({params.years * 12}期)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 25, 30].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, years: y }))}
                className={`py-2 text-center rounded-lg font-headline-sm text-headline-sm transition-all cursor-pointer ${
                  params.years === y
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {y}年
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Interest Rate Setup & LPR Adjustment */}
        {params.loanType !== 'provident' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-headline-sm text-headline-sm text-on-surface">贷款利率 (最新LPR)</span>
                <span
                  className="material-symbols-outlined text-[16px] text-on-surface-variant cursor-pointer"
                  title="中国人民银行最新公布5年期以上LPR为3.45%"
                >
                  info
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="number"
                  value={params.commercialRate}
                  onChange={(e) => setParams((p) => ({ ...p, commercialRate: Number(e.target.value) || 0 }))}
                  className="w-16 text-right bg-transparent font-headline-md text-headline-md text-primary font-bold focus:outline-none"
                  min="1.0"
                  max="10.0"
                  step="0.05"
                />
                <span className="font-headline-sm text-headline-sm text-primary font-bold">%</span>
              </div>
            </div>

            {/* Quick LPR Offset Pills */}
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <span>基准LPR 3.45% 加减基点</span>
                <span className="text-secondary font-semibold">
                  3.45% {currentBp >= 0 ? `+ ${currentBp}` : `- ${Math.abs(currentBp)}`} BP
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '减40BP', bp: -40 },
                  { label: '减20BP', bp: -20 },
                  { label: '基准LPR', bp: 0 },
                  { label: '加30BP', bp: 30 },
                ].map((item) => {
                  const isSelected = currentBp === item.bp;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleBpPreset(item.bp)}
                      className={`py-1.5 rounded font-label-caps text-label-caps text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary font-bold shadow-xs'
                          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">公积金执行利率</span>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="number"
                  value={params.providentRate}
                  onChange={(e) => setParams((p) => ({ ...p, providentRate: Number(e.target.value) || 0 }))}
                  className="w-16 text-right bg-transparent font-headline-md text-headline-md text-primary font-bold focus:outline-none"
                  step="0.05"
                />
                <span className="font-headline-sm text-headline-sm text-primary font-bold">%</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
              <span>基准首套公积金利率</span>
              <span className="text-secondary font-medium">5年以上 2.85% (5年以下 2.35%)</span>
            </div>
          </div>
        )}

        {/* Row 4: Repayment Strategy Dual Cards */}
        <div className="flex flex-col gap-1.5">
          <label className="font-headline-sm text-headline-sm text-on-surface">还款方式选择</label>
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setParams((p) => ({ ...p, repaymentMethod: 'benxi' }))}
              className={`p-3 rounded-lg cursor-pointer transition-all flex flex-col justify-between h-24 ${
                params.repaymentMethod === 'benxi'
                  ? 'bg-surface-container-high ring-2 ring-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-headline-sm text-headline-sm ${
                    params.repaymentMethod === 'benxi' ? 'text-primary font-semibold' : 'text-on-surface'
                  }`}
                >
                  等额本息
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    params.repaymentMethod === 'benxi' ? 'text-primary' : 'text-outline-variant'
                  }`}
                >
                  {params.repaymentMethod === 'benxi' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                每月还款额固定，初期负担小，资金规划稳定
              </p>
            </div>

            <div
              onClick={() => setParams((p) => ({ ...p, repaymentMethod: 'benjin' }))}
              className={`p-3 rounded-lg cursor-pointer transition-all flex flex-col justify-between h-24 ${
                params.repaymentMethod === 'benjin'
                  ? 'bg-surface-container-high ring-2 ring-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-headline-sm text-headline-sm ${
                    params.repaymentMethod === 'benjin' ? 'text-primary font-semibold' : 'text-on-surface'
                  }`}
                >
                  等额本金
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    params.repaymentMethod === 'benjin' ? 'text-primary' : 'text-outline-variant'
                  }`}
                >
                  {params.repaymentMethod === 'benjin' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                每月还款逐月递减，总利息支出相对更少
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Detail Schedule CTA Button */}
      <button
        onClick={onNavigateToSchedule}
        type="button"
        className="w-full py-3.5 px-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer font-semibold"
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        <span>查看{params.years * 12}期完整还款计划与摊销表</span>
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>

      {/* Financial Intelligence & Tip Card */}
      <div
        onClick={onNavigateToComparison}
        className="rounded-xl p-space-md bg-secondary-container/30 text-on-secondary-container flex items-start gap-3 cursor-pointer hover:bg-secondary-container/40 transition-colors"
      >
        <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5 shrink-0">lightbulb</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-headline-sm text-headline-sm text-secondary font-bold">还款规划建议</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary text-on-secondary font-medium">
              省利息
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            如选择“等额本金”，相比等额本息可累计节约总利息约{' '}
            <span className="text-secondary font-semibold">¥7.79万元</span>
            。如果您在还款满3年后有流动资金，可考虑试算提前还款缩短年限以大幅降低利息消耗。
          </p>
        </div>
      </div>

      {/* Quick Prepayment Banner Anchor */}
      <div
        onClick={onNavigateToEarlyRepayment}
        className="rounded-xl p-space-md bg-surface-container-low flex items-center justify-between shadow-xs cursor-pointer hover:bg-surface-container transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">savings</span>
          </div>
          <div>
            <span className="block font-headline-sm text-headline-sm text-on-surface font-semibold">
              提前还款推演实验室
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              计算部分提前还贷能省下多少利息
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
      </div>
    </div>
  );
};
