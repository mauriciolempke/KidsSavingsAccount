'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BalanceCalculationService } from '../services/BalanceCalculationService';
import { toastStore } from './toastStore';
import { ToastMessage, ToastContainer } from '../components/ui/Toast';

interface AppContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  runBalanceCalculation: () => Promise<void>;
  isCalculating: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Subscribe to toast store
  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    return unsubscribe;
  }, []);

  // Run balance calculation on app start
  useEffect(() => {
    runBalanceCalculation();
  }, []);

  async function runBalanceCalculation() {
    if (isCalculating) return;

    setIsCalculating(true);
    try {
      const result = await BalanceCalculationService.calculateAll();
      
      if (result.totalAccruals > 0) {
        toastStore.success(
          `Balance calculation complete! ${result.totalAccruals} accrual(s) processed.`,
          3000
        );
      }

      if (result.errors.length > 0) {
        console.error('Balance calculation errors:', result.errors);
      }
    } catch (error) {
      console.error('Balance calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  }

  function triggerRefresh() {
    setRefreshTrigger(prev => prev + 1);
  }

  function handleDismissToast(id: string) {
    toastStore.dismiss(id);
  }

  return (
    <AppContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        runBalanceCalculation,
        isCalculating,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

