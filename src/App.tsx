import { useState } from 'react';
import { LoanParams } from './types/mortgage';
import { DEFAULT_LOAN_PARAMS, calculateMortgage } from './utils/mortgageMath';
import { Header, TabKey } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CalculatorScreen } from './components/screens/CalculatorScreen';
import { ScheduleScreen } from './components/screens/ScheduleScreen';
import { ComparisonScreen } from './components/screens/ComparisonScreen';
import { EarlyRepaymentScreen } from './components/screens/EarlyRepaymentScreen';
import { ShareModal } from './components/modals/ShareModal';
import { BankApplicationModal } from './components/modals/BankApplicationModal';
import { ModifyParamsModal } from './components/modals/ModifyParamsModal';
import { CityRatesModal } from './components/modals/CityRatesModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('calculator');
  const [params, setParams] = useState<LoanParams>(DEFAULT_LOAN_PARAMS);
  const [repaidMonths, setRepaidMonths] = useState<number>(36); // Default 3 years (36 months)

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBankTemplateOpen, setIsBankTemplateOpen] = useState(false);
  const [isModifyParamsOpen, setIsModifyParamsOpen] = useState(false);
  const [isCityRatesOpen, setIsCityRatesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReset = () => {
    setParams({ ...DEFAULT_LOAN_PARAMS });
    setRepaidMonths(36);
    showToast('已重置为基准设定 (100万 30年 3.25%)');
  };

  const switchTab = (tab: TabKey) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ensure repaid months cannot exceed loan term (e.g. 10y = 120 months max)
  const maxRepaidMonths = Math.max(1, params.years * 12 - 1);
  const effectiveRepaidMonths = Math.min(repaidMonths, maxRepaidMonths);

  const handleSetRepaidMonths = (m: number) => {
    setRepaidMonths(Math.min(Math.max(1, m), maxRepaidMonths));
  };

  // Live calculated amortization result
  const result = calculateMortgage(params, effectiveRepaidMonths);

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface px-4 py-2 rounded-full text-body-sm font-body-sm shadow-xl flex items-center gap-2 border border-outline/20">
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onReset={handleReset}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenProfile={() => setIsCityRatesOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-14 pb-24 px-gutter bg-surface min-h-screen max-w-xl mx-auto">
        <div className="pt-3 pb-4">
          {currentTab === 'calculator' && (
            <CalculatorScreen
              params={params}
              setParams={setParams}
              result={result}
              onNavigateToSchedule={() => switchTab('schedule')}
              onNavigateToComparison={() => switchTab('comparison')}
              onNavigateToEarlyRepayment={() => switchTab('earlyRepayment')}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleScreen
              params={params}
              result={result}
              repaidMonths={effectiveRepaidMonths}
              setRepaidMonths={handleSetRepaidMonths}
              onNavigateToEarlyRepayment={() => switchTab('earlyRepayment')}
            />
          )}

          {currentTab === 'comparison' && (
            <ComparisonScreen
              params={params}
              setParams={setParams}
              onNavigateToSchedule={() => switchTab('schedule')}
              onNavigateToEarlyRepayment={() => switchTab('earlyRepayment')}
              onOpenModifyParams={() => setIsModifyParamsOpen(true)}
            />
          )}

          {currentTab === 'earlyRepayment' && (
            <EarlyRepaymentScreen
              params={params}
              repaidMonths={effectiveRepaidMonths}
              setRepaidMonths={handleSetRepaidMonths}
              onOpenBankTemplate={() => setIsBankTemplateOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onChangeTab={switchTab} />

      {/* Modals & Dialogs */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        params={params}
        result={result}
      />

      <BankApplicationModal
        isOpen={isBankTemplateOpen}
        onClose={() => setIsBankTemplateOpen(false)}
        params={params}
      />

      <ModifyParamsModal
        isOpen={isModifyParamsOpen}
        onClose={() => setIsModifyParamsOpen(false)}
        params={params}
        setParams={setParams}
      />

      <CityRatesModal
        isOpen={isCityRatesOpen}
        onClose={() => setIsCityRatesOpen(false)}
        setParams={setParams}
      />
    </div>
  );
}
