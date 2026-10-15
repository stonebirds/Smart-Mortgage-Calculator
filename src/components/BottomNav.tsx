import React from 'react';
import { TabKey } from './Header';

interface BottomNavProps {
  currentTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { key: 'calculator' as TabKey, label: '房贷计算', icon: 'finance' },
    { key: 'schedule' as TabKey, label: '还款明细', icon: 'calendar_month' },
    { key: 'comparison' as TabKey, label: '方案对比', icon: 'balance' },
    { key: 'earlyRepayment' as TabKey, label: '提前还款', icon: 'savings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.05)] border-t border-surface-container">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-gutter">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 transition-all active:scale-95 ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px] transition-transform"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label-caps text-label-caps tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
