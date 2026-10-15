import React from 'react';
import { LoanParams } from '../../types/mortgage';

interface ModifyParamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: LoanParams;
  setParams: React.Dispatch<React.SetStateAction<LoanParams>>;
}

export const ModifyParamsModal: React.FC<ModifyParamsModalProps> = ({
  isOpen,
  onClose,
  params,
  setParams,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">修改基准贷款设定</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-body-sm text-on-surface-variant font-medium">商业贷款金额 (万元)</label>
            <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg">
              <input
                type="number"
                value={params.commercialAmount}
                onChange={(e) => setParams((p) => ({ ...p, commercialAmount: Math.max(1, Number(e.target.value) || 0) }))}
                className="bg-transparent font-headline-md text-primary font-bold focus:outline-none w-28"
                min="5"
                max="2000"
              />
              <span className="text-body-sm font-semibold text-on-surface">万元</span>
            </div>
          </div>

          {/* Years */}
          <div className="flex flex-col gap-1">
            <label className="text-body-sm text-on-surface-variant font-medium">按揭年限</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 20, 25, 30].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, years: y }))}
                  className={`py-1.5 rounded-lg text-body-sm font-semibold cursor-pointer transition-all ${
                    params.years === y
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {y}年
                </button>
              ))}
            </div>
          </div>

          {/* Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-body-sm text-on-surface-variant font-medium">基准执行利率 (%)</label>
            <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg">
              <input
                type="number"
                value={params.commercialRate}
                onChange={(e) => setParams((p) => ({ ...p, commercialRate: Number(e.target.value) || 0 }))}
                className="bg-transparent font-headline-md text-primary font-bold focus:outline-none w-28"
                step="0.05"
                min="1.0"
                max="10.0"
              />
              <span className="text-body-sm font-semibold text-on-surface">%</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
        >
          确定并同步实时测算
        </button>
      </div>
    </div>
  );
};
