import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';
import { fetcher, postFetcher, patchFetcher, deleteFetcher } from '@/lib/swrConfig';
import type {
  PaymentCategory,
  PaymentCategoryCreate,
  PaymentCategoryUpdate,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  AccountingPeriod,
  AccountingPeriodCreate,
  AccountingPeriodUpdate,
  TransactionStats,
  Paginated,
  ApiResp,
} from '@/types/payments';

/* ==================== PAYMENT-CATEGORY HOOKS ==================== */
export const usePaymentCategories = () => {
  const { data, error, isLoading, mutate } = useSWR<Paginated<PaymentCategory>>(
    API_CONFIG.PAYMENTS.CATEGORIES_LIST,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { categories: data?.results || [], count: data?.count || 0, isLoading, error, mutate };
};

export const usePaymentCategory = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.PAYMENTS.CATEGORY_DETAIL, { id }) : null;
  const { data, error, isLoading, mutate } = useSWR<PaymentCategory>(url, fetcher);
  return { category: data, isLoading, error, mutate };
};

export const useCreatePaymentCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.CATEGORY_CREATE,
    postFetcher<PaymentCategory>
  );
  return { createCategory: trigger, isCreating: isMutating, error };
};

export const useUpdatePaymentCategory = (id: number | string) => {
  const url = buildUrl(API_CONFIG.PAYMENTS.CATEGORY_UPDATE, { id });
  const { trigger, isMutating, error } = useSWRMutation(url, patchFetcher<PaymentCategory>);
  return { updateCategory: trigger, isUpdating: isMutating, error };
};

export const useDeletePaymentCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.CATEGORY_DETAIL,
    async (base: string, { arg }: { arg: { id: number | string } }) =>
      deleteFetcher(buildUrl(base, { id: arg.id }))
  );
  return { deleteCategory: trigger, isDeleting: isMutating, error };
};

/* ==================== TRANSACTION HOOKS ==================== */
export const useTransactions = (params?: Record<string, any>) => {
  const qs = new URLSearchParams(params).toString();
  const endpoint = `${API_CONFIG.PAYMENTS.TRANSACTIONS_LIST}${qs ? `?${qs}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<Paginated<Transaction>>(endpoint, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
  return { transactions: data?.results || [], count: data?.count || 0, isLoading, error, mutate };
};

export const useTransaction = (id: string | null) => {
  const url = id ? buildUrl(API_CONFIG.PAYMENTS.TRANSACTION_DETAIL, { id }) : null;
  const { data, error, isLoading, mutate } = useSWR<Transaction>(url, fetcher);
  return { transaction: data, isLoading, error, mutate };
};

export const useCreateTransaction = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.TRANSACTION_CREATE,
    postFetcher<Transaction>
  );
  return { createTransaction: trigger, isCreating: isMutating, error };
};

export const useUpdateTransaction = (id: string) => {
  const url = buildUrl(API_CONFIG.PAYMENTS.TRANSACTION_UPDATE, { id });
  const { trigger, isMutating, error } = useSWRMutation(url, patchFetcher<Transaction>);
  return { updateTransaction: trigger, isUpdating: isMutating, error };
};

export const useDeleteTransaction = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.TRANSACTION_DELETE,
    async (base: string, { arg }: { arg: { id: string } }) =>
      deleteFetcher(buildUrl(base, { id: arg.id }))
  );
  return { deleteTransaction: trigger, isDeleting: isMutating, error };
};

export const useReconcileTransaction = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.RECONCILE,
    async (urlTmpl: string, { arg }: { arg: { id: string } }) =>
      postFetcher<Transaction>(buildUrl(urlTmpl, { id: arg.id }), { arg: {} })
  );
  return { reconcileTransaction: trigger, isReconciling: isMutating, error };
};

export const useTransactionStats = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResp<TransactionStats>>(
    API_CONFIG.PAYMENTS.STATISTICS,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { stats: data?.data, isLoading, error, mutate };
};

/* ==================== ACCOUNTING-PERIOD HOOKS ==================== */
export const useAccountingPeriods = (params?: Record<string, any>) => {
  const qs = new URLSearchParams(params).toString();
  const endpoint = `${API_CONFIG.PAYMENTS.ACCOUNTING_PERIODS_LIST}${qs ? `?${qs}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<Paginated<AccountingPeriod>>(endpoint, fetcher);
  return { periods: data?.results || [], count: data?.count || 0, isLoading, error, mutate };
};

export const useAccountingPeriod = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_DETAIL, { id }) : null;
  const { data, error, isLoading, mutate } = useSWR<AccountingPeriod>(url, fetcher);
  return { period: data, isLoading, error, mutate };
};

export const useCreateAccountingPeriod = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_CREATE,
    postFetcher<AccountingPeriod>
  );
  return { createPeriod: trigger, isCreating: isMutating, error };
};

export const useUpdateAccountingPeriod = (id: number | string) => {
  const url = buildUrl(API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_UPDATE, { id });
  const { trigger, isMutating, error } = useSWRMutation(url, patchFetcher<AccountingPeriod>);
  return { updatePeriod: trigger, isUpdating: isMutating, error };
};

export const useCloseAccountingPeriod = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.CLOSE_PERIOD,
    async (urlTmpl: string, { arg }: { arg: { id: number | string } }) =>
      postFetcher<AccountingPeriod>(buildUrl(urlTmpl, { id: arg.id }), { arg: {} })
  );
  return { closePeriod: trigger, isClosing: isMutating, error };
};

export const useRecalculateAccountingPeriod = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PAYMENTS.RECALCULATE_PERIOD,
    async (urlTmpl: string, { arg }: { arg: { id: number | string } }) =>
      postFetcher<ApiResp<AccountingPeriod>>(buildUrl(urlTmpl, { id: arg.id }), { arg: {} })
  );
  return { recalculatePeriod: trigger, isRecalculating: isMutating, error };
};