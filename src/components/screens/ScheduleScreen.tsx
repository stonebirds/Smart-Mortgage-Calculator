import React, { useState } from 'react';
import { LoanParams, CalculationResult, AmortizationPeriod } from '../../types/mortgage';
import { generateAmortizationCSV } from '../../utils/mortgageMath';

interface ScheduleScreenProps {
  params: LoanParams;
  result: CalculationResult;
  repaidMonths: number;
  setRepaidMonths: (m: number) => void;
  onNavigateToEarlyRepayment: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  params,
  result,
  repaidMonths,
  setRepaidMonths,
  onNavigateToEarlyRepayment,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all' | 'tail'>('all');
  const [showTail, setShowTail] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalPeriods = result.periods.length;
  const currentPeriodIndex = Math.min(repaidMonths, totalPeriods);
  const currentPeriod = result.periods[currentPeriodIndex - 1] || result.periods[0];

  // Calculate elapsed totals
  const elapsedPeriods = result.periods.slice(0, currentPeriodIndex);
  const totalRepaidPrincipal = elapsedPeriods.reduce((acc, p) => acc + p.principal, 0);
  const totalRepaidInterest = elapsedPeriods.reduce((acc, p) => acc + p.interest, 0);
  const remainingPrincipalWan = currentPeriod ? currentPeriod.remainingPrincipal / 10000 : 0;
  const repaidPct = totalPeriods > 0 ? ((currentPeriodIndex / totalPeriods) * 100).toFixed(1) : '0';

  // Available years from result
  const availableYears = result.yearSummaries.map((ys) => ys.year);
  const defaultYear = availableYears[0] || 2025;
  const activeYear = selectedYear === 'all' || selectedYear === 'tail' ? defaultYear : selectedYear;
  const activeYearSummary = result.yearSummaries.find((ys) => ys.year === activeYear) || result.yearSummaries[0];

  // Filter periods to render
  let displayPeriods: AmortizationPeriod[] = [];
  if (selectedYear === 'tail' || showTail) {
    displayPeriods = result.periods.slice(Math.max(0, totalPeriods - 12));
  } else if (selectedYear === 'all') {
    // Show first 15 by default for snappy performance, plus pagination or full view
    displayPeriods = result.periods.slice(0, 24);
  } else {
    displayPeriods = result.periods.filter((p) => p.year === selectedYear);
  }

  // Handle Excel Export
  const handleExportCSV = () => {
    try {
      const csvContent = generateAmortizationCSV(result, params);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `房贷360期还款明细_${params.commercialAmount}万_${params.years}年.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('360期还款明细 Excel (CSV) 已成功下载！');
    } catch {
      showToast('导出失败，请重试');
    }
  };

  // Handle PDF / Print
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface px-4 py-2 rounded-full text-body-sm font-body-sm shadow-lg flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 贷款核心看板 / 还款进度概览 */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-surface-container-high rounded-full opacity-60 pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-caps font-label-caps font-semibold">
                {params.loanType === 'commercial'
                  ? '商业贷款'
                  : params.loanType === 'provident'
                  ? '公积金贷款'
                  : '组合贷款'}
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                {params.repaymentMethod === 'benxi' ? '等额本息' : '等额本金'} · {params.years}年({totalPeriods}期)
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-display-hero-mobile font-display-hero-mobile text-primary tracking-tight font-bold">
                {result.totalLoanWan.toFixed(2)}
              </span>
              <span className="text-body-md font-body-md text-on-surface-variant">万元</span>
              <span className="ml-2 text-body-sm font-body-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                利率 {params.commercialRate}%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
        </div>

        {/* 进度条与还款演变统计 */}
        <div className="mt-space-md pt-space-sm bg-surface-container-low rounded-lg p-space-sm">
          <div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
            <div className="flex items-center gap-1 text-on-surface">
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                第 {currentPeriodIndex} 期
              </span>
              <span className="text-on-surface-variant">/ {totalPeriods}期</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
              已还 {repaidPct}%
            </span>
          </div>

          {/* 进度指示条 with interactive slider to simulate progress */}
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden flex relative">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(1, (currentPeriodIndex / totalPeriods) * 100)}%` }}
            ></div>
          </div>
          <input
            type="range"
            min="1"
            max={totalPeriods}
            value={currentPeriodIndex}
            onChange={(e) => setRepaidMonths(Number(e.target.value))}
            className="w-full h-1 opacity-0 -mt-2 cursor-pointer"
            title="滑动调整当前已还期数"
          />

          {/* 核心指标三列 */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-center border-t border-surface-container">
            <div className="flex flex-col items-center">
              <span className="text-label-caps font-label-caps text-on-surface-variant">剩余本金</span>
              <span className="text-headline-sm font-headline-sm text-on-surface mt-0.5 font-bold">
                ¥{remainingPrincipalWan.toFixed(1)}万
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-label-caps font-label-caps text-on-surface-variant">已还本金</span>
              <span className="text-headline-sm font-headline-sm text-primary mt-0.5 font-bold">
                ¥{Math.round(totalRepaidPrincipal).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-label-caps font-label-caps text-on-surface-variant">累计付息</span>
              <span className="text-headline-sm font-headline-sm text-error mt-0.5 font-bold">
                ¥{Math.round(totalRepaidInterest).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 年份横向胶囊切换与汇总 */}
      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_view_month</span>
            <h2 className="text-headline-sm font-headline-sm text-on-surface font-semibold">年份周期检索</h2>
          </div>
          <div className="text-body-sm font-body-sm text-on-surface-variant">
            月均还款{' '}
            <span className="text-on-surface font-headline-sm font-semibold">
              ¥{result.firstMonthlyPayment.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 年份切换横向滑动卡片 */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {result.yearSummaries.slice(0, 4).map((ys) => {
            const isSelected = selectedYear === ys.year || (selectedYear === 'all' && ys.year === defaultYear);
            return (
              <button
                key={ys.year}
                type="button"
                onClick={() => {
                  setSelectedYear(ys.year);
                  setShowTail(false);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg shadow-xs transition-all flex flex-col items-center min-w-[84px] cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="text-headline-sm font-headline-sm">{ys.year}年</span>
                <span className={`text-label-caps font-label-caps ${isSelected ? 'opacity-90' : 'text-on-surface-variant'}`}>
                  {ys.count === 12 ? '12期完整' : `第${ys.periodStart}-${ys.periodEnd}期`}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setShowTail(false);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg shadow-xs transition-all flex flex-col items-center min-w-[84px] cursor-pointer ${
              selectedYear === 'all' && !showTail
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="text-headline-sm font-headline-sm">全部年份</span>
            <span className="text-label-caps font-label-caps text-on-surface-variant">展开总表</span>
          </button>
        </div>

        {/* 当前选中年份汇总卡片 */}
        {activeYearSummary && (
          <div className="bg-surface-container-high rounded-xl p-space-sm flex items-center justify-between text-on-surface mt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">query_stats</span>
              </div>
              <div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">
                  {activeYearSummary.year}年度应还本息
                </div>
                <div className="text-headline-sm font-headline-sm text-primary font-bold">
                  ¥{activeYearSummary.totalPayment.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">本金合计</div>
                <div className="text-body-sm font-body-sm text-on-surface font-semibold">
                  ¥{activeYearSummary.totalPrincipal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-px h-6 bg-outline-variant"></div>
              <div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">利息合计</div>
                <div className="text-body-sm font-body-sm text-error font-semibold">
                  ¥{activeYearSummary.totalInterest.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 本金与利息图例说明 */}
      <div className="flex items-center justify-between px-1 text-label-caps font-label-caps text-on-surface-variant">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            <span>月供本金</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container inline-block"></span>
            <span>月供利息</span>
          </div>
        </div>
        <span className="text-on-surface-variant flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[14px]">info</span>
          初期付息占比较高
        </span>
      </div>

      {/* 明细列表 (流式卡片) */}
      <section className="flex flex-col gap-2.5">
        {displayPeriods.map((period) => {
          const isCurrent = period.period === currentPeriodIndex;
          const isPaid = period.period < currentPeriodIndex;
          const priPct = (period.principalRatio * 100).toFixed(1);
          const intPct = (period.interestRatio * 100).toFixed(1);

          return (
            <article
              key={period.period}
              className={`bg-surface-container-lowest rounded-xl p-space-sm shadow-xs flex flex-col gap-2 relative overflow-hidden transition-all ${
                isCurrent ? 'ring-2 ring-primary shadow-sm' : ''
              }`}
            >
              {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
              <div className={`flex items-center justify-between ${isCurrent ? 'pl-1' : ''}`}>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-label-caps font-label-caps font-semibold ${
                      isCurrent
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    第 {period.period} 期
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">{period.date}</span>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-0.5 text-secondary text-label-caps font-label-caps bg-secondary-container/30 px-1.5 py-0.5 rounded font-semibold">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span> 已还
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-0.5 text-primary text-label-caps font-label-caps bg-primary-fixed px-1.5 py-0.5 rounded font-semibold">
                      待还款
                    </span>
                  ) : null}
                </div>
                <div className="text-right">
                  <span
                    className={`text-headline-sm font-headline-sm font-bold ${
                      isCurrent ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    ¥{period.payment.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Visual Split Bar */}
              <div className={`w-full bg-surface-container h-1.5 rounded-full flex overflow-hidden ${isCurrent ? 'ml-1' : ''}`}>
                <div className="bg-primary h-full" style={{ width: `${priPct}%` }}></div>
                <div className="bg-secondary-container h-full" style={{ width: `${intPct}%` }}></div>
              </div>

              <div className={`grid grid-cols-3 text-body-sm font-body-sm pt-0.5 text-on-surface-variant ${isCurrent ? 'pl-1' : ''}`}>
                <div>
                  <span className="text-label-caps font-label-caps block text-on-surface-variant/80">当期本金</span>
                  <span className="text-on-surface font-semibold">
                    ¥{period.principal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-label-caps font-label-caps block text-on-surface-variant/80">当期利息</span>
                  <span className="text-error font-semibold">
                    ¥{period.interest.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-label-caps font-label-caps block text-on-surface-variant/80">剩余本金</span>
                  <span className="text-on-surface font-medium">
                    ¥{period.remainingPrincipal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {/* 后期对比示范折叠卡片 (展示后期本金多利息少的反转) */}
        <div
          onClick={() => setShowTail(!showTail)}
          className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">swap_vert</span>
            <div>
              <div className="text-body-sm font-body-sm font-semibold text-on-surface">
                {showTail ? '收起末期反转展示' : '查看末期反转特征 (第 350-360 期)'}
              </div>
              <div className="text-label-caps font-label-caps text-on-surface-variant">
                末期利息仅几十元，月供以本金为主
              </div>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${
              showTail ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
        </div>
      </section>

      {/* 底部导出与操作栏 */}
      <section className="mt-space-sm flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-space-sm">
          <button
            onClick={handleExportCSV}
            type="button"
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-container transition-all active:scale-98 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">table_view</span>
            <span className="text-body-md font-body-md font-semibold">导出 Excel</span>
          </button>
          <button
            onClick={handlePrintPDF}
            type="button"
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-container transition-all active:scale-98 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
            <span className="text-body-md font-body-md font-semibold">生成 PDF 清单</span>
          </button>
        </div>

        {/* 提前还款试算快捷入口浮动通知 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">trending_down</span>
            </div>
            <div>
              <div className="text-body-sm font-body-sm font-semibold text-on-surface">有闲置资金想减少利息？</div>
              <div className="text-label-caps font-label-caps text-on-surface-variant">
                支持提前还款模拟、缩短年限试算
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToEarlyRepayment}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-caps font-label-caps shadow-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            测算减免
          </button>
        </div>
      </section>
    </div>
  );
};
