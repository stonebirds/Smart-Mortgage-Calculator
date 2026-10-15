import React, { useState } from 'react';
import { LoanParams, PrepaymentConfig } from '../../types/mortgage';
import { calculatePrepayment } from '../../utils/mortgageMath';

interface EarlyRepaymentScreenProps {
  params: LoanParams;
  repaidMonths: number;
  setRepaidMonths: (m: number) => void;
  onOpenBankTemplate: () => void;
}

export const EarlyRepaymentScreen: React.FC<EarlyRepaymentScreenProps> = ({
  params,
  repaidMonths,
  setRepaidMonths,
  onOpenBankTemplate,
}) => {
  const [mode, setMode] = useState<'partial' | 'full'>('partial');
  const [strategy, setStrategy] = useState<'shorten' | 'reducePayment'>('shorten');
  const [prepayAmountWan, setPrepayAmountWan] = useState<number>(20);
  const [penaltyType, setPenaltyType] = useState<'none' | 'onePercent'>('none');
  const [showRepaidSlider, setShowRepaidSlider] = useState<boolean>(false);

  const totalLoanMonths = params.years * 12;
  const effectiveRepaidMonths = Math.min(Math.max(1, repaidMonths || 36), totalLoanMonths - 1);

  // Configuration for Prepayment calculation
  const prepayConfig: PrepaymentConfig = {
    mode,
    prepayAmountWan,
    strategy,
    penaltyType,
    repaidMonths: effectiveRepaidMonths,
  };

  const prepayResult = calculatePrepayment(params, prepayConfig);

  const chips = [10, 20, 30, 50];

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Original Loan Quick Insight Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance
            </span>
            <span className="text-base text-on-surface font-bold">原贷款档案</span>
          </div>
          <span className="font-label-caps text-label-caps text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
            商贷基准 {params.commercialRate}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low rounded-lg p-3 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant font-medium">原始总额 / 年限</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl text-on-surface font-bold">
                {params.commercialAmount}
              </span>
              <span className="text-xs text-on-surface-variant">万 / {params.years}年</span>
            </div>
          </div>

          <div
            onClick={() => setShowRepaidSlider(!showRepaidSlider)}
            className="bg-surface-container-low rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">已还期数</span>
              <span className="text-[11px] text-primary flex items-center font-semibold">
                调整 <span className="material-symbols-outlined text-[14px]">tune</span>
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl text-primary font-bold">
                {effectiveRepaidMonths}
              </span>
              <span className="text-xs text-on-surface-variant">
                期 (整{(effectiveRepaidMonths / 12).toFixed(1)}年)
              </span>
            </div>
          </div>
        </div>

        {/* Repaid months slider drawer */}
        {showRepaidSlider && (
          <div className="mt-3 p-3 bg-surface-container-low rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">模拟已还贷款时长</span>
              <span className="font-bold text-primary">
                {effectiveRepaidMonths} 期 ({Math.floor(effectiveRepaidMonths / 12)}年
                {effectiveRepaidMonths % 12}个月)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={totalLoanMonths - 1}
              value={effectiveRepaidMonths}
              onChange={(e) => setRepaidMonths(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
            />
            <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
              <span>第1年</span>
              <span>第3年 (满3年)</span>
              <span>第5年</span>
              <span>最末期</span>
            </div>
          </div>
        )}

        {/* Remaining Principal Highlighting Pill with distinct top margin */}
        <div className="mt-3.5 bg-primary-fixed/50 rounded-lg p-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">timelapse</span>
            <span className="text-xs text-on-primary-fixed-variant font-semibold">当前剩余待还本金</span>
          </div>
          <span className="text-base sm:text-lg text-primary font-bold">
            ¥{Math.round(prepayResult.currentRemainingWan * 10000).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Repayment Scheme Configuration Hub */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">拟还款方案配置</h2>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">支持实时动态测算</span>
        </div>

        {/* Toggle 1: Partial vs Full Settlement */}
        <div className="bg-surface-container-high p-1 rounded-lg flex items-center">
          <button
            onClick={() => setMode('partial')}
            className={`flex-1 py-2 rounded-md font-headline-sm text-headline-sm text-center transition-all cursor-pointer ${
              mode === 'partial'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            部分提前还款
          </button>
          <button
            onClick={() => setMode('full')}
            className={`flex-1 py-2 rounded-md font-headline-sm text-headline-sm text-center transition-all cursor-pointer ${
              mode === 'full'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            一次性全部结清
          </button>
        </div>

        {/* Partial Amount Input Block */}
        {mode === 'partial' && (
          <div className="flex flex-col gap-space-xs">
            <div className="flex justify-between items-center">
              <label className="font-body-sm text-body-sm text-on-surface-variant">拟提前偿还本金</label>
              <div className="flex gap-1.5">
                {chips.map((amt) => {
                  const isSelected = prepayAmountWan === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPrepayAmountWan(amt)}
                      className={`px-2 py-0.5 rounded text-body-sm font-body-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                          : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {amt}万
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl px-space-md py-3 flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">¥</span>
                <input
                  type="number"
                  value={prepayAmountWan}
                  onChange={(e) => setPrepayAmountWan(Math.max(1, Math.min(Math.round(prepayResult.currentRemainingWan), Number(e.target.value) || 0)))}
                  className="bg-transparent font-metric-large text-metric-large text-primary w-28 focus:outline-none font-bold"
                  min="1"
                  max={Math.round(prepayResult.currentRemainingWan)}
                />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">万元</span>
            </div>
          </div>
        )}

        {/* Dual Strategy Selector: Shorten Period vs Reduce Payment */}
        {mode === 'partial' && (
          <div className="flex flex-col gap-space-xs">
            <label className="font-body-sm text-body-sm text-on-surface-variant">还款后核心目标选择</label>
            <div className="grid grid-cols-2 gap-space-sm">
              {/* Strategy A: Shorten Term */}
              <button
                type="button"
                onClick={() => setStrategy('shorten')}
                className={`relative text-left p-space-sm rounded-xl flex flex-col justify-between transition-all cursor-pointer ${
                  strategy === 'shorten'
                    ? 'bg-primary-fixed/20 ring-2 ring-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span
                    className={`font-headline-sm text-headline-sm ${
                      strategy === 'shorten' ? 'text-primary font-bold' : 'text-on-surface font-semibold'
                    }`}
                  >
                    缩短还款年限
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      strategy === 'shorten' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">月供保持不变</p>
                <div className="mt-space-sm inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-label-caps text-label-caps self-start font-medium">
                  <span className="material-symbols-outlined text-[13px]">trending_down</span>
                  <span>省息最大化</span>
                </div>
              </button>

              {/* Strategy B: Reduce Monthly Bill */}
              <button
                type="button"
                onClick={() => setStrategy('reducePayment')}
                className={`relative text-left p-space-sm rounded-xl flex flex-col justify-between transition-all cursor-pointer ${
                  strategy === 'reducePayment'
                    ? 'bg-primary-fixed/20 ring-2 ring-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span
                    className={`font-headline-sm text-headline-sm ${
                      strategy === 'reducePayment' ? 'text-primary font-bold' : 'text-on-surface font-semibold'
                    }`}
                  >
                    减少每月月供
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      strategy === 'reducePayment' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">剩余年限不变</p>
                <div className="mt-space-sm inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-label-caps text-label-caps self-start font-medium">
                  <span className="material-symbols-outlined text-[13px]">payments</span>
                  <span>减轻月度压力</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Penalty & Fee Config Row */}
        <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">verified_user</span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-on-surface truncate">
                提前还款违约金 / 手续费
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {effectiveRepaidMonths >= 36 ? '还款满3年多数银行免收违约金' : '未满3年可能收取1%违约金'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPenaltyType(penaltyType === 'none' ? 'onePercent' : 'none')}
            className={`shrink-0 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
              penaltyType === 'none'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <span>{penaltyType === 'none' ? '无违约金' : '1% 违约金'}</span>
            <span className="material-symbols-outlined text-[15px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Savings Effect Showcase Card (Delight & Clarity Anchor) */}
      <div className="bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl p-space-md shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-surface-tint/20 blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-secondary-fixed text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              savings
            </span>
            <span className="font-headline-sm text-headline-sm text-secondary-fixed font-semibold">测算收益看板</span>
          </div>
          <span className="font-label-caps text-label-caps bg-on-primary/10 backdrop-blur-md px-2.5 py-1 rounded-full text-primary-fixed font-semibold">
            利息节约 {prepayResult.savedRatioPct.toFixed(1)}%
          </span>
        </div>

        <div className="mt-space-md relative z-10">
          <span className="font-body-sm text-body-sm text-primary-fixed opacity-90">预计累计为您立省利息</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display-hero-mobile text-display-hero-mobile text-on-primary font-bold tracking-tight">
              ¥
            </span>
            <span className="font-display-hero text-display-hero text-on-primary font-bold">
              {prepayResult.savedInterestWan.toFixed(2)}
            </span>
            <span className="font-headline-sm text-headline-sm text-primary-fixed ml-1 font-semibold">万元</span>
          </div>
        </div>

        {/* Comparative Breakdown Matrix */}
        <div className="mt-space-md pt-space-sm grid grid-cols-2 gap-space-sm bg-on-primary/10 rounded-lg p-space-sm backdrop-blur-md relative z-10">
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-primary-fixed">缩短还款周期</span>
            <span className="font-headline-md text-headline-md text-on-primary mt-1 font-bold">
              {prepayResult.shortenedYearsText}
            </span>
            <span className="font-body-sm text-body-sm text-on-primary-container mt-0.5">
              {prepayResult.newEndDateText}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-primary-fixed">新月供支出</span>
            <span className="font-headline-md text-headline-md text-on-primary mt-1 font-bold">
              ¥{Math.round(prepayResult.newMonthlyPayment).toLocaleString()} /月
            </span>
            <span className="font-body-sm text-body-sm text-on-primary-container mt-0.5">
              {prepayResult.monthlyChangeText}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Cash Flow Timeline Sparkline Representation */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">还款周期本息构成对比</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">按等额本息计算</span>
        </div>

        {/* Stacked Visual Bar */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{
                width: `${Math.max(
                  5,
                  (prepayResult.remainingPrincipalWan /
                    (prepayResult.remainingPrincipalWan +
                      prepayResult.newRemainingInterestWan +
                      prepayResult.savedInterestBarWan || 1)) *
                    100
                )}%`,
              }}
            ></div>
            <div
              className="bg-secondary h-full transition-all duration-300"
              style={{
                width: `${Math.max(
                  5,
                  (prepayResult.newRemainingInterestWan /
                    (prepayResult.remainingPrincipalWan +
                      prepayResult.newRemainingInterestWan +
                      prepayResult.savedInterestBarWan || 1)) *
                    100
                )}%`,
              }}
            ></div>
            <div
              className="bg-surface-tint h-full opacity-40 transition-all duration-300"
              style={{
                width: `${Math.max(
                  5,
                  (prepayResult.savedInterestBarWan /
                    (prepayResult.remainingPrincipalWan +
                      prepayResult.newRemainingInterestWan +
                      prepayResult.savedInterestBarWan || 1)) *
                    100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <span>剩余本金 ({prepayResult.remainingPrincipalWan.toFixed(1)}万)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
              <span>结余利息 ({prepayResult.newRemainingInterestWan.toFixed(1)}万)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-tint opacity-50 inline-block"></span>
              <span>已省 ({prepayResult.savedInterestBarWan.toFixed(1)}万)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Advice & Pitfall Warning Section */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">lightbulb</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            房贷还款决策智囊与避坑指南
          </h3>
        </div>

        {/* Pitfall Card 1: Low-Rate Consideration */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex gap-space-sm items-start">
          <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[18px]">percent</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              公积金或极低存量利率无需急还
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              若您的公积金贷款利率仅在 2.85% 左右，或持有利率已降至历史低点，资金用于稳健理财、大额存单或家庭流动资金储备往往能获得更充裕的抗风险弹性。
            </p>
          </div>
        </div>

        {/* Pitfall Card 2: 1/3 and 1/2 Threshold Warning */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex gap-space-sm items-start">
          <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-on-error-container shrink-0">
            <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              注意“临界周期”收益递减定律
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              <strong className="font-semibold text-on-surface">等额本金已过 1/3 期</strong>，或{' '}
              <strong className="font-semibold text-on-surface">等额本息已还过 1/2 期</strong>
              ，前期已偿还绝大部分利息，此时提前还款主要冲抵的是本金，省息效用大幅衰减，建议审慎评估机会成本。
            </p>
          </div>
        </div>

        {/* Action Prompt Footer Pill */}
        <div className="bg-surface-container p-space-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">contact_support</span>
            <span className="font-body-sm text-body-sm text-on-surface font-medium">需要打印正式银行还款申请书？</span>
          </div>
          <button
            onClick={onOpenBankTemplate}
            className="text-primary font-headline-sm text-headline-sm flex items-center gap-0.5 active:translate-x-0.5 transition-all cursor-pointer font-semibold"
            type="button"
          >
            <span>查看模板</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
