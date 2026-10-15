import React, { useState } from 'react';
import { LoanParams, CalculationResult } from '../../types/mortgage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: LoanParams;
  result: CalculationResult;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  params,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = `【房贷测算方案简报】\n` +
    `• 贷款总额：${result.totalLoanWan.toFixed(2)} 万元 (${params.loanType === 'commercial' ? '商业贷款' : params.loanType === 'provident' ? '公积金' : '组合'})\n` +
    `• 贷款期限：${params.years} 年 (${params.years * 12} 期)\n` +
    `• 执行利率：${params.commercialRate}%\n` +
    `• 还款方式：${params.repaymentMethod === 'benxi' ? '等额本息' : '等额本金'}\n` +
    `• 预计首月月供：¥${result.firstMonthlyPayment.toFixed(2)}\n` +
    `• 累计总利息：${result.totalInterestWan.toFixed(2)} 万元\n` +
    `• 本息还款总计：${result.totalRepayWan.toFixed(2)} 万元\n` +
    `生成于 Smart Mortgage Calculator`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">share</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">分享测算报告</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Poster preview card */}
        <div className="rounded-xl p-4 bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md flex flex-col gap-2">
          <div className="flex justify-between items-center text-label-caps font-label-caps opacity-90">
            <span>SMART MORTGAGE</span>
            <span>{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="mt-1">
            <span className="text-body-sm opacity-80">
              {params.repaymentMethod === 'benxi' ? '等额本息' : '等额本金'} · 预计月供
            </span>
            <div className="text-2xl font-bold tracking-tight">
              ¥{result.firstMonthlyPayment.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal opacity-80"> /月</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/15 text-center text-xs">
            <div>
              <span className="opacity-75 block text-[10px]">贷款本金</span>
              <span className="font-semibold">{result.totalLoanWan.toFixed(0)}万</span>
            </div>
            <div>
              <span className="opacity-75 block text-[10px]">利息总计</span>
              <span className="font-semibold text-amber-300">{result.totalInterestWan.toFixed(2)}万</span>
            </div>
            <div>
              <span className="opacity-75 block text-[10px]">还款总计</span>
              <span className="font-semibold">{result.totalRepayWan.toFixed(2)}万</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? '已复制文本' : '复制测算摘要'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>打印</span>
          </button>
        </div>
      </div>
    </div>
  );
};
