import React, { useState } from 'react';
import { LoanParams } from '../../types/mortgage';
import { calculateMortgage } from '../../utils/mortgageMath';

interface ComparisonScreenProps {
  params: LoanParams;
  setParams: React.Dispatch<React.SetStateAction<LoanParams>>;
  onNavigateToSchedule: () => void;
  onNavigateToEarlyRepayment: () => void;
  onOpenModifyParams: () => void;
}

export const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  params,
  onNavigateToSchedule,
  onNavigateToEarlyRepayment,
  onOpenModifyParams,
}) => {
  // Compute both plans under the same parameters
  const benxiResult = calculateMortgage({ ...params, repaymentMethod: 'benxi' });
  const benjinResult = calculateMortgage({ ...params, repaymentMethod: 'benjin' });

  // Difference
  const diffInterestYuan = Math.round((benxiResult.totalInterestWan - benjinResult.totalInterestWan) * 10000);
  const diffMonthsEquivalent = Math.round(diffInterestYuan / benxiResult.firstMonthlyPayment);

  // Intersection Break-even calculation
  // M_benxi = benxiResult.firstMonthlyPayment
  // M_benjin(k) = P/n + (P - (k-1)*P/n)*r
  // Solve for k when M_benjin(k) = M_benxi
  const P = benxiResult.totalLoanWan * 10000;
  const n = params.years * 12;
  const r = (params.commercialRate / 100) / 12;
  const monthlyPrincipal = P / n;
  let breakEvenPeriod = 135;
  if (r > 0 && monthlyPrincipal * r > 0) {
    const rawK = 1 + (monthlyPrincipal + P * r - benxiResult.firstMonthlyPayment) / (monthlyPrincipal * r);
    breakEvenPeriod = Math.min(n - 1, Math.max(1, Math.round(rawK)));
  }
  const breakEvenYears = (breakEvenPeriod / 12).toFixed(0);

  // Quiz interactive state
  const [quizIncome, setQuizIncome] = useState<'growth' | 'stable'>('growth');
  const [quizSavings, setQuizSavings] = useState<'invest' | 'clear'>('clear');

  const isBenxiRecommended = quizIncome === 'stable' || quizSavings === 'invest';

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* 1. 顶部贷款核心设定概览 */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">基准贷款设定</span>
          </div>
          <button
            onClick={onOpenModifyParams}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span className="font-label-caps text-label-caps font-semibold">修改参数</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-space-xs pt-1">
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">商业贷款额</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-metric-small text-metric-small text-on-surface font-bold">
                {params.commercialAmount}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">万元</span>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">还款年限</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-metric-small text-metric-small text-on-surface font-bold">
                {params.years}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">年 ({params.years * 12}期)</span>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">基准执行利率</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="font-metric-small text-metric-small text-on-surface font-bold">
                {params.commercialRate}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 直观差额高光卡片 (利息差额直观体现) */}
      <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-space-md shadow-md">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-secondary-fixed text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                insights
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-primary-fixed">利息差额精算</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-primary-fixed font-label-caps text-label-caps backdrop-blur-sm">
              省息方案
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-body-md text-body-md text-primary-fixed font-medium">等额本金总共可省</span>
            <span className="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight text-white">
              ¥{diffInterestYuan.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 pt-2 border-t border-white/10">
            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-fixed text-[15px]">savings</span>
            </div>
            <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-snug">
              节省金额相当于少还{' '}
              <span className="text-secondary-fixed font-semibold">{diffMonthsEquivalent} 个月</span>{' '}
              的本息月供，可添置全套智能家电或一次家庭装修。
            </p>
          </div>
        </div>
      </div>

      {/* 2. 左右双栏 PK / 对比核心卡片 */}
      <div className="grid grid-cols-2 gap-space-sm">
        {/* 等额本息卡片 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm flex flex-col justify-between shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">等额本息</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                平稳型
              </span>
            </div>
            <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
              <span className="font-body-sm text-body-sm text-on-surface-variant">每月固定月供</span>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-metric-small text-metric-small text-primary font-bold">
                  ¥{Math.floor(benxiResult.firstMonthlyPayment).toLocaleString()}
                </span>
                <span className="font-body-sm text-body-sm text-primary font-bold">
                  .{(benxiResult.firstMonthlyPayment % 1).toFixed(2).slice(2)}
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-outline mt-1">
                全程{params.years * 12}期金额恒定
              </span>
            </div>
            <div className="flex flex-col gap-1.5 py-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">总还利息</span>
                <span className="font-semibold text-on-surface">{benxiResult.totalInterestWan.toFixed(2)}万</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">累计还款</span>
                <span className="font-semibold text-on-surface">{benxiResult.totalRepayWan.toFixed(2)}万</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-primary-fixed-variant font-label-caps text-label-caps">
                前期压力小
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-primary-fixed-variant font-label-caps text-label-caps">
                好做现金流规划
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-outline">适合人群画像</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              收入稳定工薪族、年轻置业刚需、期望前期留足流动资金者。
            </p>
          </div>
        </div>

        {/* 等额本金卡片 (推荐高光) */}
        <div className="relative bg-surface-container-lowest rounded-xl p-space-sm flex flex-col justify-between shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0">
            <span className="inline-block bg-secondary text-on-secondary font-label-caps text-label-caps px-2 py-0.5 rounded-bl-lg font-medium">
              推荐省息
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">等额本金</span>
            </div>
            <div className="bg-secondary-container/30 rounded-lg p-2.5 flex flex-col">
              <span className="font-body-sm text-body-sm text-on-surface-variant">首月最高月供</span>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-metric-small text-metric-small text-secondary font-bold">
                  ¥{Math.floor(benjinResult.firstMonthlyPayment).toLocaleString()}
                </span>
                <span className="font-body-sm text-body-sm text-secondary font-bold">
                  .{(benjinResult.firstMonthlyPayment % 1).toFixed(2).slice(2)}
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-secondary font-medium mt-1">
                每月递减约 ¥{benjinResult.monthlyDecrease?.toFixed(1) || '8.5'}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 py-1">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">总还利息</span>
                <span className="font-semibold text-secondary">{benjinResult.totalInterestWan.toFixed(2)}万</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">累计还款</span>
                <span className="font-semibold text-on-surface">{benjinResult.totalRepayWan.toFixed(2)}万</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-secondary-container/60 text-on-secondary-container font-label-caps text-label-caps">
                省息{(diffInterestYuan / 10000).toFixed(2)}万
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps">
                前期供款高
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-outline">适合人群画像</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              前期储蓄充裕、中年家庭、或预期未来有提前还款计划者。
            </p>
          </div>
        </div>
      </div>

      {/* 4. 多维对比图表或交互条形图 */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              月供走向与平衡拐点
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              第 {breakEvenPeriod} 期（约{breakEvenYears}年）月供打平后本金更轻松
            </span>
          </div>
          <div className="flex items-center gap-3 font-label-caps text-label-caps">
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary inline-block"></span>
              <span className="text-on-surface-variant">等额本息</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-secondary inline-block"></span>
              <span className="text-on-surface-variant">等额本金</span>
            </div>
          </div>
        </div>

        {/* 月供趋势简图 (SVG) */}
        <div className="w-full bg-surface-container-low rounded-xl p-3 flex flex-col">
          <div className="w-full h-36 relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 120">
              {/* 背景辅助虚线网格 */}
              <line opacity="0.5" stroke="#c4c5d5" strokeDasharray="2 2" strokeWidth="0.8" x1="20" x2="310" y1="20" y2="20" />
              <line opacity="0.5" stroke="#c4c5d5" strokeDasharray="2 2" strokeWidth="0.8" x1="20" x2="310" y1="65" y2="65" />
              <line opacity="0.5" stroke="#c4c5d5" strokeDasharray="2 2" strokeWidth="0.8" x1="20" x2="310" y1="105" y2="105" />

              {/* 等额本息（平直基准线: 约4352元对应 y=65） */}
              <line stroke="#00288e" strokeDasharray="4 3" strokeWidth="2.5" x1="25" x2="305" y1="65" y2="65" />

              {/* 等额本金（斜向下递减实线: 从5486元 y=20 到 2780元 y=105） */}
              <line stroke="#006a61" strokeLinecap="round" strokeWidth="2.5" x1="25" x2="305" y1="22" y2="105" />

              {/* 交叉平衡点 (第135期) */}
              <circle cx="140" cy="65" fill="#ffffff" r="4.5" stroke="#006a61" strokeWidth="2.5" />
              <text fill="#006a61" fontSize="9" fontWeight="600" textAnchor="middle" x="140" y="54">
                第{breakEvenYears}年平衡点
              </text>

              {/* 坐标刻度文本 */}
              <text fill="#757684" fontSize="8" x="5" y="24">
                {(benjinResult.firstMonthlyPayment / 1000).toFixed(1)}k
              </text>
              <text fill="#757684" fontSize="8" x="5" y="68">
                {(benxiResult.firstMonthlyPayment / 1000).toFixed(1)}k
              </text>
              <text fill="#757684" fontSize="8" x="5" y="108">
                {((benjinResult.lastMonthlyPayment || 2780) / 1000).toFixed(1)}k
              </text>
              <text fill="#757684" fontSize="8" x="25" y="118">
                第1期
              </text>
              <text fill="#757684" fontSize="8" x="140" y="118">
                第{breakEvenPeriod}期
              </text>
              <text fill="#757684" fontSize="8" x="285" y="118">
                {params.years * 12}期
              </text>
            </svg>
          </div>
          <div className="mt-2 text-center bg-surface-container-lowest/80 rounded-lg py-1 px-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              前 {breakEvenYears} 年本息方案月供较低，{breakEvenYears} 年后本金方案更划算且月供逐渐降至 2,800 元以下
            </span>
          </div>
        </div>

        {/* 总成本结构对比条 */}
        <div className="flex flex-col gap-2.5">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">还款总成本构成</span>
          {/* 本息条形 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-body-sm font-body-sm">
              <span className="font-medium text-on-surface">等额本息 (总额 {benxiResult.totalRepayWan.toFixed(2)}万)</span>
              <span className="text-on-surface-variant">利息占比 {benxiResult.interestRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${benxiResult.principalRatio}%` }}
                title={`本金 ${benxiResult.totalLoanWan.toFixed(2)}万`}
              ></div>
              <div
                className="h-full bg-surface-tint"
                style={{ width: `${benxiResult.interestRatio}%` }}
                title={`利息 ${benxiResult.totalInterestWan.toFixed(2)}万`}
              ></div>
            </div>
          </div>
          {/* 本金条形 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-body-sm font-body-sm">
              <span className="font-medium text-on-surface">等额本金 (总额 {benjinResult.totalRepayWan.toFixed(2)}万)</span>
              <span className="text-secondary font-medium">
                利息占比 {benjinResult.interestRatio.toFixed(1)}% (-{(diffInterestYuan / 10000).toFixed(2)}万)
              </span>
            </div>
            <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary"
                style={{ width: `${benjinResult.principalRatio}%` }}
                title={`本金 ${benjinResult.totalLoanWan.toFixed(2)}万`}
              ></div>
              <div
                className="h-full bg-secondary"
                style={{ width: `${benjinResult.interestRatio}%` }}
                title={`利息 ${benjinResult.totalInterestWan.toFixed(2)}万`}
              ></div>
            </div>
          </div>
          {/* 图例说明 */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <div className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <span>本金 {benxiResult.totalLoanWan.toFixed(0)}万</span>
            </div>
            <div className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-tint inline-block"></span>
              <span>本息利息 {benxiResult.totalInterestWan.toFixed(2)}万</span>
            </div>
            <div className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
              <span>本金利息 {benjinResult.totalInterestWan.toFixed(2)}万</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 决策建议与智能推荐测试模块 */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">测测哪种方式更适合你？</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">回答两道简单财务偏好，获取专属建议</p>
          </div>
        </div>

        {/* 交互选择题 1 */}
        <div className="flex flex-col gap-2">
          <span className="font-body-md text-body-md font-semibold text-on-surface">1. 您未来3~5年的收入预期是？</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex flex-col items-start p-3 rounded-lg transition-all active:scale-[0.98] text-left cursor-pointer ${
                quizIncome === 'growth'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
              onClick={() => setQuizIncome('growth')}
              type="button"
            >
              <span className="font-headline-sm text-headline-sm font-semibold">成长型 / 稳中有升</span>
              <span className={`font-body-sm text-body-sm mt-0.5 ${quizIncome === 'growth' ? 'opacity-85' : 'text-on-surface-variant'}`}>
                薪资有调幅，升职空间大
              </span>
            </button>
            <button
              className={`flex flex-col items-start p-3 rounded-lg transition-all active:scale-[0.98] text-left cursor-pointer ${
                quizIncome === 'stable'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
              onClick={() => setQuizIncome('stable')}
              type="button"
            >
              <span className="font-headline-sm text-headline-sm font-semibold">稳定型 / 变化不大</span>
              <span className={`font-body-sm text-body-sm mt-0.5 ${quizIncome === 'stable' ? 'opacity-85' : 'text-on-surface-variant'}`}>
                体制内或追求现金流稳妥
              </span>
            </button>
          </div>
        </div>

        {/* 交互选择题 2 */}
        <div className="flex flex-col gap-2">
          <span className="font-body-md text-body-md font-semibold text-on-surface">2. 您的手头储备金与理财偏好？</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex flex-col items-start p-3 rounded-lg transition-all active:scale-[0.98] text-left cursor-pointer ${
                quizSavings === 'invest'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
              onClick={() => setQuizSavings('invest')}
              type="button"
            >
              <span className="font-headline-sm text-headline-sm font-semibold">追求资金流动性</span>
              <span className={`font-body-sm text-body-sm mt-0.5 ${quizSavings === 'invest' ? 'opacity-85' : 'text-on-surface-variant'}`}>
                留足应急钱或偏好投资
              </span>
            </button>
            <button
              className={`flex flex-col items-start p-3 rounded-lg transition-all active:scale-[0.98] text-left cursor-pointer ${
                quizSavings === 'clear'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
              onClick={() => setQuizSavings('clear')}
              type="button"
            >
              <span className="font-headline-sm text-headline-sm font-semibold">极度讨厌负债利息</span>
              <span className={`font-body-sm text-body-sm mt-0.5 ${quizSavings === 'clear' ? 'opacity-85' : 'text-on-surface-variant'}`}>
                前期首付后仍有充足储蓄
              </span>
            </button>
          </div>
        </div>

        {/* 匹配结果推荐卡 (动态变化反馈) */}
        <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-3 transition-all duration-300">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">thumb_up</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {isBenxiRecommended ? '智能推荐：等额本息方式' : '智能推荐：等额本金方式'}
              </span>
              <span className="px-1.5 py-0.2 bg-secondary text-on-secondary rounded text-[10px] font-medium">
                {isBenxiRecommended ? '匹配度 94%' : '匹配度 92%'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {isBenxiRecommended
                ? `您侧重于保障当前生活流动资金，固定每月 ¥${benxiResult.firstMonthlyPayment.toLocaleString('zh-CN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} 的月供不会造成生活突发冲击，利于长期投资理财增值。`
                : `您的抗风险能力较强或有明确减负诉求，选择“等额本金”能在利息支出上节省近 ${(diffInterestYuan / 10000).toFixed(1)} 万元，且越还越轻松！`}
            </p>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex gap-space-sm pt-1">
          <button
            onClick={onNavigateToSchedule}
            className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-primary font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            <span>逐期还款明细</span>
          </button>
          <button
            onClick={onNavigateToEarlyRepayment}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold shadow-sm flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">savings</span>
            <span>测算提前还款</span>
          </button>
        </div>
      </div>
    </div>
  );
};
