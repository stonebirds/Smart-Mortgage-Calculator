import React from 'react';

export type TabKey = 'calculator' | 'schedule' | 'comparison' | 'earlyRepayment';

interface HeaderProps {
  currentTab: TabKey;
  onReset: () => void;
  onOpenShare: () => void;
  onOpenProfile: () => void;
}

const TAB_TITLES: Record<TabKey, string> = {
  calculator: 'Mortgage Calculator',
  schedule: 'Repayment Schedule',
  comparison: 'Plan Comparison',
  earlyRepayment: 'Early Repayment',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onReset,
  onOpenShare,
  onOpenProfile,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="max-w-xl mx-auto h-14 px-3 sm:px-gutter flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">calculate</span>
          </div>
          <h1 className="text-[17px] sm:text-[19px] text-on-surface tracking-tight font-bold whitespace-nowrap truncate">
            {TAB_TITLES[currentTab]}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onReset}
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary active:scale-95 transition-all cursor-pointer"
            title="重置为基准设定"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>
          <button
            onClick={onOpenShare}
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary active:scale-95 transition-all cursor-pointer"
            title="导出与分享方案"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="h-8 px-2 rounded-full bg-primary text-on-primary flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer text-xs font-semibold"
            title="各地公积金及商贷基准利率"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">percent</span>
            <span className="hidden xs:inline text-[11px]">基准</span>
          </button>
        </div>
      </div>
    </header>
  );
};
