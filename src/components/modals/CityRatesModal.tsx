import React from 'react';
import { LoanParams } from '../../types/mortgage';

interface CityRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  setParams: React.Dispatch<React.SetStateAction<LoanParams>>;
}

interface CityRateInfo {
  city: string;
  firstHomeRate: number;
  secondHomeRate: number;
  providentRate: number;
  tag: string;
}

const CITY_RATES: CityRateInfo[] = [
  { city: '全国基准', firstHomeRate: 3.25, secondHomeRate: 3.65, providentRate: 2.85, tag: 'LPR -20BP' },
  { city: '北京', firstHomeRate: 3.15, secondHomeRate: 3.55, providentRate: 2.85, tag: '五环外/内差异化' },
  { city: '上海', firstHomeRate: 3.15, secondHomeRate: 3.35, providentRate: 2.85, tag: '新政利率下调' },
  { city: '深圳', firstHomeRate: 3.15, secondHomeRate: 3.55, providentRate: 2.85, tag: '特区标准' },
  { city: '广州', firstHomeRate: 2.95, secondHomeRate: 3.15, providentRate: 2.85, tag: '已破3.0%' },
  { city: '杭州', firstHomeRate: 3.05, secondHomeRate: 3.35, providentRate: 2.85, tag: '全面取消房贷下限' },
  { city: '成都', firstHomeRate: 3.00, secondHomeRate: 3.30, providentRate: 2.85, tag: '历史低位' },
];

export const CityRatesModal: React.FC<CityRatesModalProps> = ({
  isOpen,
  onClose,
  setParams,
}) => {
  if (!isOpen) return null;

  const applyCityRate = (rate: number) => {
    setParams((p) => ({ ...p, commercialRate: rate }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 border border-surface-container max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-surface-container pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">percent</span>
            </div>
            <div>
              <h3 className="text-base text-on-surface font-bold">主流城市商贷与公积金利率</h3>
              <p className="text-xs text-on-surface-variant">点击城市卡片即可快速套用当地首套房执行利率</p>
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

        <div className="flex flex-col gap-2">
          {CITY_RATES.map((item) => (
            <div
              key={item.city}
              onClick={() => applyCityRate(item.firstHomeRate)}
              className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {item.city}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant">
                    {item.tag}
                  </span>
                </div>
                <div className="text-body-sm text-on-surface-variant mt-0.5">
                  公积金基准: {item.providentRate}%
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline-md text-headline-md text-primary font-bold">
                  {item.firstHomeRate.toFixed(2)}%
                </div>
                <div className="text-[11px] text-on-surface-variant">首套主流参考</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
