import React, { useState } from 'react';
import { LoanParams } from '../../types/mortgage';

interface BankApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: LoanParams;
}

export const BankApplicationModal: React.FC<BankApplicationModalProps> = ({
  isOpen,
  onClose,
  params,
}) => {
  const [borrowerName, setBorrowerName] = useState('张建国');
  const [contractNumber, setContractNumber] = useState('2022-DK-889021');
  const [prepayType, setPrepayType] = useState('部分提前还款 (缩短还款期限)');
  const [prepayAmount, setPrepayAmount] = useState('200,000.00');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `个人住房抵押贷款提前还款申请书\n` +
      `借款人姓名：${borrowerName}\n` +
      `贷款合同编号：${contractNumber}\n` +
      `原借款金额：${params.commercialAmount}万元整，借款期限：${params.years}年\n` +
      `申请提前还款方式：${prepayType}\n` +
      `拟提前归还本金：人民币 ${prepayAmount} 元\n` +
      `还款账户：扣款绑定储蓄卡账户\n` +
      `申请人承诺本资金为合法自有资金。`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4 border border-surface-container">
        <div className="flex flex-col gap-1.5 border-b border-surface-container pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg text-on-surface font-bold">
                  提前还款申请书模板
                </h3>
                <span className="text-[11px] font-semibold bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
                  银行标准示范文本
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center cursor-pointer shrink-0"
              title="关闭"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-xs text-on-surface-variant pl-10">
            可用于各商业银行线下柜台办理或手机银行APP线上还款申请填写参考
          </p>
        </div>

        {/* Paper style document */}
        <div className="bg-[#fefefe] border border-[#d2d9f4] rounded-xl p-5 text-[#131b2e] flex flex-col gap-3 font-serif shadow-inner text-sm leading-relaxed">
          <div className="text-center font-bold text-lg border-b border-dashed border-[#c4c5d5] pb-2 font-sans">
            个人住房商业贷款提前偿还本息申请表
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <label className="text-on-surface-variant block">申请借款人：</label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full bg-surface-container-low px-2 py-1 rounded font-semibold text-on-surface mt-0.5 border border-transparent focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-on-surface-variant block">原贷款合同号：</label>
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full bg-surface-container-low px-2 py-1 rounded font-semibold text-on-surface mt-0.5 border border-transparent focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs font-sans flex flex-col gap-1">
            <span className="text-on-surface-variant">原贷款基础信息：</span>
            <div className="p-2 bg-surface-container-low rounded text-on-surface">
              原始贷款总额 <strong>{params.commercialAmount} 万元</strong>，贷款期限{' '}
              <strong>{params.years} 年</strong>，执行基准利率 <strong>{params.commercialRate}%</strong>
            </div>
          </div>

          <div className="text-xs font-sans">
            <label className="text-on-surface-variant block">本次拟还款类型：</label>
            <select
              value={prepayType}
              onChange={(e) => setPrepayType(e.target.value)}
              className="w-full bg-surface-container-low px-2 py-1.5 rounded font-semibold text-on-surface mt-0.5 border border-transparent focus:border-primary focus:outline-none"
            >
              <option value="部分提前还款 (缩短还款期限，月供保持不变)">
                部分提前还款 (缩短还款期限，月供保持不变)
              </option>
              <option value="部分提前还款 (减少每月月供，还款期限保持不变)">
                部分提前还款 (减少每月月供，还款期限保持不变)
              </option>
              <option value="一次性结清全部剩余房贷本息并申请注销抵押">
                一次性结清全部剩余房贷本息并申请注销抵押
              </option>
            </select>
          </div>

          <div className="text-xs font-sans">
            <label className="text-on-surface-variant block">拟提前偿还本金金额（元）：</label>
            <input
              type="text"
              value={prepayAmount}
              onChange={(e) => setPrepayAmount(e.target.value)}
              className="w-full bg-surface-container-low px-2 py-1.5 rounded font-bold text-primary mt-0.5 border border-transparent focus:border-primary focus:outline-none"
            />
          </div>

          <p className="text-xs text-on-surface-variant mt-2 font-sans">
            本人特向贵行申请办理上述提前还款业务，保证还款资金来源合法合规，并知悉依据相关合同约定办理扣款及相关抵押解除手续。
          </p>

          <div className="pt-3 border-t border-dashed border-[#c4c5d5] flex justify-between items-end text-xs font-sans">
            <div>
              <p>申请人（签字按手印）：___________</p>
              <p className="mt-1">联系电话：138****0000</p>
            </div>
            <div className="text-right">
              <p>申请日期：{new Date().toLocaleDateString('zh-CN')}</p>
              <div className="mt-2 w-20 h-10 border border-error/40 text-error text-[10px] flex items-center justify-center rounded-sm">
                [ 银行预受理章 ]
              </div>
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
            <span>{copied ? '已复制文本' : '复制申请书文本'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>打印单据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
