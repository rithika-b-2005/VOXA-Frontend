'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  expensesApi,
  categoriesApi,
  claimsApi,
  vendorsApi,
  paymentsApi,
  debtsApi,
  goalsApi,
  assetsApi,
  liabilitiesApi,
  netWorthApi,
  remindersApi,
  subscriptionsApi,
  savingTipsApi,
  benchmarksApi,
  recommendationsApi,
  taxEstimationApi,
  BenchmarkFilters,
} from '@/lib/api';

// Generic hook for API calls
export function useApi<T>(
  fetcher: () => Promise<{ data?: T; error?: string }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetcher();
    if (result.error) {
      setError(result.error);
    } else {
      setData(result.data || null);
    }
    setLoading(false);
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Expenses hooks
export function useExpenses(filters?: { categoryId?: string; status?: string; date?: string }) {
  return useApi(() => expensesApi.getAll(filters), [filters?.categoryId, filters?.status, filters?.date]);
}

export function useExpense(id: string) {
  return useApi(() => expensesApi.getOne(id), [id]);
}

export function useExpenseStats() {
  return useApi(() => expensesApi.getStats(), []);
}

export function useSpendingTrend(days?: number) {
  return useApi(() => expensesApi.getTrend(days), [days]);
}

export function useCategoryBreakdown() {
  return useApi(() => expensesApi.getCategoryBreakdown(), []);
}

// Categories hooks
export function useCategories() {
  return useApi(() => categoriesApi.getAll(), []);
}

export function useCategory(id: string) {
  return useApi(() => categoriesApi.getOne(id), [id]);
}

// Claims hooks
export function useClaims() {
  return useApi(() => claimsApi.getAll(), []);
}

export function useClaim(id: string) {
  return useApi(() => claimsApi.getOne(id), [id]);
}

// Vendors hooks
export function useVendors() {
  return useApi(() => vendorsApi.getAll(), []);
}

export function useVendor(id: string) {
  return useApi(() => vendorsApi.getOne(id), [id]);
}

// Payments hooks
export function usePayments() {
  return useApi(() => paymentsApi.getAll(), []);
}

export function usePayment(id: string) {
  return useApi(() => paymentsApi.getOne(id), [id]);
}

export function usePaymentStats() {
  return useApi(() => paymentsApi.getStats(), []);
}

// Dashboard hook - combines multiple data sources
export function useDashboard() {
  const [data, setData] = useState<{
    expenses: any[];
    categories: any[];
    stats: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, categoriesRes, statsRes] = await Promise.all([
        expensesApi.getAll(),
        categoriesApi.getAll(),
        expensesApi.getStats(),
      ]);

      if (expensesRes.error || categoriesRes.error || statsRes.error) {
        setError(expensesRes.error || categoriesRes.error || statsRes.error || 'Error loading data');
      } else {
        setData({
          expenses: expensesRes.data || [],
          categories: categoriesRes.data || [],
          stats: statsRes.data || {},
        });
      }
    } catch (e) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Debts hooks
export function useDebts() {
  return useApi(() => debtsApi.getAll(), []);
}

export function useDebt(id: string) {
  return useApi(() => debtsApi.getOne(id), [id]);
}

export function useDebtPayoffPlan(method: 'avalanche' | 'snowball', extraPayment?: number) {
  return useApi(() => debtsApi.getPayoffPlan(method, extraPayment), [method, extraPayment]);
}

// Goals hooks
export function useGoals() {
  return useApi(() => goalsApi.getAll(), []);
}

export function useGoal(id: string) {
  return useApi(() => goalsApi.getOne(id), [id]);
}

// Assets hooks
export function useAssets() {
  return useApi(() => assetsApi.getAll(), []);
}

export function useAsset(id: string) {
  return useApi(() => assetsApi.getOne(id), [id]);
}

// Liabilities hooks
export function useLiabilities() {
  return useApi(() => liabilitiesApi.getAll(), []);
}

export function useLiability(id: string) {
  return useApi(() => liabilitiesApi.getOne(id), [id]);
}

// Net Worth hooks
export function useNetWorth() {
  return useApi(() => netWorthApi.getCurrent(), []);
}

export function useNetWorthHistory(months?: number) {
  return useApi(() => netWorthApi.getHistory(months), [months]);
}

// Reminders hooks
export function useReminders(filter?: 'all' | 'upcoming' | 'overdue' | 'paid') {
  return useApi(() => remindersApi.getAll(filter), [filter]);
}

export function useReminder(id: string) {
  return useApi(() => remindersApi.getOne(id), [id]);
}

export function useUpcomingReminders(days?: number) {
  return useApi(() => remindersApi.getUpcoming(days), [days]);
}

// Subscriptions hooks
export function useSubscriptions() {
  return useApi(() => subscriptionsApi.getAll(), []);
}

export function useSubscription(id: string) {
  return useApi(() => subscriptionsApi.getOne(id), [id]);
}

export function useSubscriptionStats() {
  return useApi(() => subscriptionsApi.getStats(), []);
}

// Saving Tips hooks
export function useSavingTips() {
  return useApi(() => savingTipsApi.getAll(), []);
}

export function useSavingTipsSummary() {
  return useApi(() => savingTipsApi.getSummary(), []);
}

export function useSpendingAnalysis() {
  return useApi(() => savingTipsApi.getSpendingAnalysis(), []);
}

// Benchmarks hooks
export function useBenchmarks(filters?: BenchmarkFilters) {
  return useApi(
    () => benchmarksApi.getComparison(filters),
    [filters?.ageGroup, filters?.incomeRange, filters?.locationType]
  );
}

export function useBenchmarkSummary(filters?: BenchmarkFilters) {
  return useApi(
    () => benchmarksApi.getSummary(filters),
    [filters?.ageGroup, filters?.incomeRange, filters?.locationType]
  );
}

// Recommendations hooks
export function useRecommendations(type?: 'article' | 'video' | 'podcast' | 'course') {
  return useApi(() => recommendationsApi.getAll(type), [type]);
}

export function usePersonalizedRecommendations() {
  return useApi(() => recommendationsApi.getPersonalized(), []);
}

export function useSavedRecommendations() {
  return useApi(() => recommendationsApi.getSaved(), []);
}

// Tax Estimation hooks
export function useTaxBrackets(filingStatus: string, year?: number) {
  return useApi(() => taxEstimationApi.getBrackets(filingStatus, year), [filingStatus, year]);
}

export function useTaxDeductions(filingStatus: string, year?: number) {
  return useApi(() => taxEstimationApi.getDeductions(filingStatus, year), [filingStatus, year]);
}

export function useSavedTaxEstimates() {
  return useApi(() => taxEstimationApi.getSavedEstimates(), []);
}
