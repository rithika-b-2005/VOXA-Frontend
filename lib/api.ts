const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Something went wrong' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

// Auth APIs
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    fetchApi<{ accessToken: string; user: { id: string; email: string; firstName?: string; lastName?: string; role: string } }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ accessToken: string; user: { id: string; email: string; firstName?: string; lastName?: string; role: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: () => fetchApi<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
    isPremium?: boolean;
    darkMode?: boolean;
    budgetAlerts?: boolean;
    emailAlerts?: boolean;
    monthlyReports?: boolean;
  }>('/users/me'),
};

// User APIs
export const userApi = {
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    fetchApi('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updatePreferences: (data: { darkMode?: boolean; budgetAlerts?: boolean; emailAlerts?: boolean; monthlyReports?: boolean }) =>
    fetchApi('/users/preferences', { method: 'PUT', body: JSON.stringify(data) }),
};

// Expenses APIs
export const expensesApi = {
  getAll: (filters?: { categoryId?: string; status?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('createdAt', filters.date); // Filter by createdAt date
    const query = params.toString() ? `?${params}` : '';
    return fetchApi<any[]>(`/expenses${query}`);
  },

  getOne: (id: string) => fetchApi<any>(`/expenses/${id}`),

  create: (data: {
    amount: number;
    date: string;
    description?: string;
    merchant?: string;
    categoryId?: string;
    currency?: string;
  }) => fetchApi<{ id: string }>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/expenses/${id}`, { method: 'DELETE' }),

  getStats: () => fetchApi<any>('/expenses/stats'),

  getTrend: (days?: number) => fetchApi<{ date: string; income: number; expense: number }[]>(`/expenses/trend${days ? `?days=${days}` : ''}`),

  getCategoryBreakdown: () => fetchApi<{ name: string; amount: number }[]>('/expenses/categories/breakdown'),

  // Premium features
  exportTransactions: (transactionIds?: string[]) =>
    fetchApi<any[]>('/expenses/export', {
      method: 'POST',
      body: JSON.stringify({ transactionIds }),
    }),

  getShareData: (transactionIds?: string[]) =>
    fetchApi<{
      transactions: any[];
      summary: { totalIncome: number; totalExpense: number; netBalance: number; count: number };
    }>('/expenses/share', {
      method: 'POST',
      body: JSON.stringify({ transactionIds }),
    }),

  uploadReceipt: async (expenseId: string, file: File) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/uploads/receipt/${expenseId}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Failed to upload receipt' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please try again.' };
    }
  },

  deleteReceipt: (expenseId: string) =>
    fetchApi(`/uploads/receipt/${expenseId}`, { method: 'DELETE' }),

  previewImport: async (file: File) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/uploads/import/preview`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Failed to preview file' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please try again.' };
    }
  },

  importTransactions: async (file: File, replaceExisting: boolean = false) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replaceExisting', replaceExisting.toString());

      const response = await fetch(`${API_URL}/uploads/import`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Failed to import transactions' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please try again.' };
    }
  },

  scanReceipt: async (file: File) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/uploads/scan`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Failed to scan receipt' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please try again.' };
    }
  },
};

// Categories APIs
export const categoriesApi = {
  getAll: () => fetchApi<any[]>('/categories'),

  getOne: (id: string) => fetchApi<any>(`/categories/${id}`),

  create: (data: { name: string; description?: string; color?: string; icon?: string }) =>
    fetchApi('/categories', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// Claims APIs
export const claimsApi = {
  getAll: () => fetchApi('/claims'),

  getOne: (id: string) => fetchApi(`/claims/${id}`),

  create: (data: { title: string; description?: string; totalAmount: number }) =>
    fetchApi('/claims', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/claims/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  submit: (id: string) => fetchApi(`/claims/${id}/submit`, { method: 'POST' }),

  delete: (id: string) => fetchApi(`/claims/${id}`, { method: 'DELETE' }),
};

// Vendors APIs
export const vendorsApi = {
  getAll: () => fetchApi('/vendors'),

  getOne: (id: string) => fetchApi(`/vendors/${id}`),

  create: (data: { name: string; email?: string; phone?: string; address?: string }) =>
    fetchApi('/vendors', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/vendors/${id}`, { method: 'DELETE' }),
};

// Payments APIs
export const paymentsApi = {
  getAll: () => fetchApi('/payments'),

  getOne: (id: string) => fetchApi(`/payments/${id}`),

  create: (data: { amount: number; method: string; vendorId?: string; invoiceId?: string }) =>
    fetchApi('/payments', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchApi(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/payments/${id}`, { method: 'DELETE' }),

  getStats: () => fetchApi('/payments/stats'),
};

// AI APIs for transactions
export const aiApi = {
  suggestCategory: (data: { description: string; merchant?: string; amount?: number }) =>
    fetchApi('/expenses/ai/suggest-category', { method: 'POST', body: JSON.stringify(data) }),

  autoCategorize: (transactionIds: string[]) =>
    fetchApi('/expenses/ai/auto-categorize', { method: 'POST', body: JSON.stringify({ transactionIds }) }),

  detectAnomalies: () => fetchApi('/expenses/ai/detect-anomalies'),

  getInsights: () => fetchApi('/expenses/ai/insights'),
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async () => {
    const [expenseStats, categories] = await Promise.all([
      expensesApi.getStats(),
      categoriesApi.getAll(),
    ]);
    return { expenseStats: expenseStats.data, categories: categories.data };
  },
};

// Stripe Payment APIs (commented out - using Razorpay instead)
// export const stripeApi = { ... };

// Razorpay Payment APIs
export const razorpayApi = {
  createOrder: (data: { amount: number; plan: 'monthly' | 'yearly' }) =>
    fetchApi<{ orderId: string; amount: number; currency: string; keyId: string }>('/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyPayment: (data: { orderId: string; paymentId: string; signature: string; plan: 'monthly' | 'yearly' }) =>
    fetchApi<{ success: boolean; message: string }>('/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Budget Types
export interface BudgetStatus {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  period: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface BudgetAlert {
  budgetId: string;
  categoryName: string | null;
  type: '50' | '80' | '100';
  percentage: number;
  message: string;
}

export interface Budget {
  id: string;
  amount: number;
  spent: number;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  alertAt50: boolean;
  alertAt80: boolean;
  alertAt100: boolean;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  amount: number;
  period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate?: string;
  categoryId?: string;
  alertAt50?: boolean;
  alertAt80?: boolean;
  alertAt100?: boolean;
}

// Budgets APIs
export const budgetsApi = {
  getAll: () => fetchApi<Budget[]>('/budgets'),

  getOne: (id: string) => fetchApi<Budget>(`/budgets/${id}`),

  create: (data: CreateBudgetData) =>
    fetchApi<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateBudgetData>) =>
    fetchApi<Budget>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/budgets/${id}`, { method: 'DELETE' }),

  getStatus: () =>
    fetchApi<{
      budgets: BudgetStatus[];
      overall: { totalBudget: number; totalSpent: number; percentage: number };
    }>('/budgets/status'),

  getAlerts: () => fetchApi<BudgetAlert[]>('/budgets/alerts'),

  getBreakdown: (period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY') =>
    fetchApi<{ categoryId: string | null; name: string; amount: number; color: string | null; percentage: number }[]>(
      `/budgets/breakdown${period ? `?period=${period}` : ''}`
    ),

  resetAlerts: (id: string) =>
    fetchApi(`/budgets/${id}/reset-alerts`, { method: 'POST' }),
};

// ============== DEBTS (Debt Planner) ==============
export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'auto_loan' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtData {
  name: string;
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'auto_loan' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: number;
}

export const debtsApi = {
  getAll: () => fetchApi<Debt[]>('/debts'),
  getOne: (id: string) => fetchApi<Debt>(`/debts/${id}`),
  create: (data: CreateDebtData) =>
    fetchApi<Debt>('/debts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateDebtData>) =>
    fetchApi<Debt>(`/debts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/debts/${id}`, { method: 'DELETE' }),
  getPayoffPlan: (method: 'avalanche' | 'snowball', extraPayment?: number) =>
    fetchApi<{ debts: any[]; totalInterest: number; payoffDate: string; monthlyPayment: number }>(
      `/debts/payoff-plan?method=${method}${extraPayment ? `&extraPayment=${extraPayment}` : ''}`
    ),
};

// ============== GOALS (Savings Goals) ==============
export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
  monthlyContribution?: number;
  isCompleted: boolean;
  completedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
  monthlyContribution?: number;
}

export const goalsApi = {
  getAll: () => fetchApi<SavingsGoal[]>('/goals'),
  getOne: (id: string) => fetchApi<SavingsGoal>(`/goals/${id}`),
  create: (data: CreateGoalData) =>
    fetchApi<SavingsGoal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateGoalData>) =>
    fetchApi<SavingsGoal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/goals/${id}`, { method: 'DELETE' }),
  contribute: (id: string, amount: number) =>
    fetchApi<SavingsGoal>(`/goals/${id}/contribute`, { method: 'POST', body: JSON.stringify({ amount }) }),
  markComplete: (id: string) =>
    fetchApi<SavingsGoal>(`/goals/${id}/complete`, { method: 'POST' }),
};

// ============== ASSETS (Net Worth) ==============
export interface Asset {
  id: string;
  name: string;
  type: 'cash' | 'savings' | 'investment' | 'retirement' | 'property' | 'vehicle' | 'crypto' | 'other';
  value: number;
  institution?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetData {
  name: string;
  type: 'cash' | 'savings' | 'investment' | 'retirement' | 'property' | 'vehicle' | 'crypto' | 'other';
  value: number;
  institution?: string;
  notes?: string;
}

export const assetsApi = {
  getAll: () => fetchApi<Asset[]>('/assets'),
  getOne: (id: string) => fetchApi<Asset>(`/assets/${id}`),
  create: (data: CreateAssetData) =>
    fetchApi<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateAssetData>) =>
    fetchApi<Asset>(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/assets/${id}`, { method: 'DELETE' }),
};

// ============== LIABILITIES (Net Worth) ==============
export interface Liability {
  id: string;
  name: string;
  type: 'credit_card' | 'mortgage' | 'auto_loan' | 'student_loan' | 'personal_loan' | 'other';
  balance: number;
  interestRate?: number;
  minimumPayment?: number;
  institution?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityData {
  name: string;
  type: 'credit_card' | 'mortgage' | 'auto_loan' | 'student_loan' | 'personal_loan' | 'other';
  balance: number;
  interestRate?: number;
  minimumPayment?: number;
  institution?: string;
  notes?: string;
}

export const liabilitiesApi = {
  getAll: () => fetchApi<Liability[]>('/liabilities'),
  getOne: (id: string) => fetchApi<Liability>(`/liabilities/${id}`),
  create: (data: CreateLiabilityData) =>
    fetchApi<Liability>('/liabilities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateLiabilityData>) =>
    fetchApi<Liability>(`/liabilities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/liabilities/${id}`, { method: 'DELETE' }),
};

// ============== NET WORTH ==============
export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  userId: string;
}

export const netWorthApi = {
  getCurrent: () => fetchApi<{ totalAssets: number; totalLiabilities: number; netWorth: number }>('/net-worth'),
  getHistory: (months?: number) =>
    fetchApi<NetWorthSnapshot[]>(`/net-worth/history${months ? `?months=${months}` : ''}`),
  takeSnapshot: () => fetchApi<NetWorthSnapshot>('/net-worth/snapshot', { method: 'POST' }),
};

// ============== REMINDERS (Bill Reminders) ==============
export interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  categoryId?: string;
  category?: { id: string; name: string; color?: string };
  isPaid: boolean;
  paidAt?: string;
  isAutomatic: boolean;
  remindDaysBefore: number;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderData {
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  categoryId?: string;
  isAutomatic?: boolean;
  remindDaysBefore?: number;
  notes?: string;
}

export const remindersApi = {
  getAll: (filter?: 'all' | 'upcoming' | 'overdue' | 'paid') =>
    fetchApi<BillReminder[]>(`/reminders${filter ? `?filter=${filter}` : ''}`),
  getOne: (id: string) => fetchApi<BillReminder>(`/reminders/${id}`),
  create: (data: CreateReminderData) =>
    fetchApi<BillReminder>('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateReminderData>) =>
    fetchApi<BillReminder>(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/reminders/${id}`, { method: 'DELETE' }),
  markPaid: (id: string) =>
    fetchApi<BillReminder>(`/reminders/${id}/mark-paid`, { method: 'POST' }),
  getUpcoming: (days?: number) =>
    fetchApi<BillReminder[]>(`/reminders/upcoming${days ? `?days=${days}` : ''}`),
};

// ============== SUBSCRIPTIONS ==============
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: string;
  categoryId?: string;
  category?: { id: string; name: string; color?: string };
  status: 'active' | 'paused' | 'cancelled';
  provider?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: string;
  categoryId?: string;
  provider?: string;
  notes?: string;
}

export const subscriptionsApi = {
  getAll: () => fetchApi<Subscription[]>('/subscriptions'),
  getOne: (id: string) => fetchApi<Subscription>(`/subscriptions/${id}`),
  create: (data: CreateSubscriptionData) =>
    fetchApi<Subscription>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateSubscriptionData>) =>
    fetchApi<Subscription>(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/subscriptions/${id}`, { method: 'DELETE' }),
  pause: (id: string) =>
    fetchApi<Subscription>(`/subscriptions/${id}/pause`, { method: 'POST' }),
  resume: (id: string) =>
    fetchApi<Subscription>(`/subscriptions/${id}/resume`, { method: 'POST' }),
  cancel: (id: string) =>
    fetchApi<Subscription>(`/subscriptions/${id}/cancel`, { method: 'POST' }),
  getStats: () => fetchApi<{ monthlyTotal: number; yearlyTotal: number; count: number }>('/subscriptions/stats'),
};

// ============== SAVING TIPS ==============
export interface SavingTip {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
  isApplied: boolean;
  appliedAt?: string;
}

export const savingTipsApi = {
  getAll: () => fetchApi<SavingTip[]>('/saving-tips'),
  getSummary: () => fetchApi<{
    totalPotentialSavings: number;
    appliedSavings: number;
    tipsCount: number;
    appliedCount: number;
  }>('/saving-tips/summary'),
  markApplied: (id: string) =>
    fetchApi<SavingTip>(`/saving-tips/${id}/apply`, { method: 'POST' }),
  dismiss: (id: string) =>
    fetchApi(`/saving-tips/${id}/dismiss`, { method: 'POST' }),
  getSpendingAnalysis: () => fetchApi<{
    categories: { name: string; amount: number; percentage: number; trend: 'up' | 'down' | 'stable' }[];
  }>('/saving-tips/spending-analysis'),
};

// ============== BENCHMARKS ==============
export interface BenchmarkData {
  category: string;
  userSpending: number;
  averageSpending: number;
  topSaversSpending: number;
  percentile: number;
}

export interface BenchmarkFilters {
  ageGroup?: string;
  incomeRange?: string;
  locationType?: string;
}

export const benchmarksApi = {
  getComparison: (filters?: BenchmarkFilters) => {
    const params = new URLSearchParams();
    if (filters?.ageGroup) params.append('ageGroup', filters.ageGroup);
    if (filters?.incomeRange) params.append('incomeRange', filters.incomeRange);
    if (filters?.locationType) params.append('locationType', filters.locationType);
    const query = params.toString() ? `?${params}` : '';
    return fetchApi<BenchmarkData[]>(`/benchmarks/comparison${query}`);
  },
  getSummary: (filters?: BenchmarkFilters) => {
    const params = new URLSearchParams();
    if (filters?.ageGroup) params.append('ageGroup', filters.ageGroup);
    if (filters?.incomeRange) params.append('incomeRange', filters.incomeRange);
    if (filters?.locationType) params.append('locationType', filters.locationType);
    const query = params.toString() ? `?${params}` : '';
    return fetchApi<{
      overallPercentile: number;
      savingsRate: number;
      averageSavingsRate: number;
      totalCategories: number;
      betterThanAverage: number;
    }>(`/benchmarks/summary${query}`);
  },
};

// ============== RECOMMENDATIONS (Content) ==============
export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast' | 'course';
  url: string;
  duration?: string;
  topic: string;
  isSaved: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export const recommendationsApi = {
  getAll: (type?: 'article' | 'video' | 'podcast' | 'course') =>
    fetchApi<ContentRecommendation[]>(`/recommendations${type ? `?type=${type}` : ''}`),
  getPersonalized: () => fetchApi<ContentRecommendation[]>('/recommendations/personalized'),
  save: (id: string) =>
    fetchApi<ContentRecommendation>(`/recommendations/${id}/save`, { method: 'POST' }),
  unsave: (id: string) =>
    fetchApi<ContentRecommendation>(`/recommendations/${id}/unsave`, { method: 'POST' }),
  markCompleted: (id: string) =>
    fetchApi<ContentRecommendation>(`/recommendations/${id}/complete`, { method: 'POST' }),
  getSaved: () => fetchApi<ContentRecommendation[]>('/recommendations/saved'),
};

// ============== TAX ESTIMATION ==============
export interface TaxInput {
  grossIncome: number;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  deductionType: 'standard' | 'itemized';
  itemizedDeductions?: number;
  taxCredits?: number;
  retirementContributions?: number;
  selfEmploymentIncome?: number;
  state?: string;
}

export interface TaxEstimation {
  grossIncome: number;
  adjustedGrossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  takeHomePay: number;
  breakdown: {
    bracket: string;
    rate: number;
    amount: number;
  }[];
}

export const taxEstimationApi = {
  calculate: (data: TaxInput) =>
    fetchApi<TaxEstimation>('/tax-estimation/calculate', { method: 'POST', body: JSON.stringify(data) }),
  getBrackets: (filingStatus: string, year?: number) =>
    fetchApi<{ brackets: { min: number; max: number; rate: number }[] }>(
      `/tax-estimation/brackets?filingStatus=${filingStatus}${year ? `&year=${year}` : ''}`
    ),
  getDeductions: (filingStatus: string, year?: number) =>
    fetchApi<{ standardDeduction: number }>(
      `/tax-estimation/deductions?filingStatus=${filingStatus}${year ? `&year=${year}` : ''}`
    ),
  saveEstimate: (data: TaxInput & { name?: string }) =>
    fetchApi('/tax-estimation/save', { method: 'POST', body: JSON.stringify(data) }),
  getSavedEstimates: () => fetchApi<(TaxInput & { id: string; name: string; createdAt: string })[]>('/tax-estimation/saved'),
};
