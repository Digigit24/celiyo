import  client  from '@/lib/client';
import { API_CONFIG, buildUrl } from '@/lib/apiConfig';
import type {
  PaymentCategoryCreate,
  PaymentCategoryUpdate,
  TransactionCreate,
  TransactionUpdate,
  AccountingPeriodCreate,
  AccountingPeriodUpdate,
} from '@/types/payments';

/* ---------- Payment-Category ---------- */
export const listPaymentCategories = (params?: Record<string, any>) =>
  client.get(API_CONFIG.PAYMENTS.CATEGORIES_LIST, { params });

export const getPaymentCategory = (id: number | string) =>
  client.get(buildUrl(API_CONFIG.PAYMENTS.CATEGORY_DETAIL, { id }));

export const createPaymentCategory = (data: PaymentCategoryCreate) =>
  client.post(API_CONFIG.PAYMENTS.CATEGORY_CREATE, data);

export const updatePaymentCategory = (id: number | string, data: PaymentCategoryUpdate) =>
  client.patch(buildUrl(API_CONFIG.PAYMENTS.CATEGORY_UPDATE, { id }), data);

export const deletePaymentCategory = (id: number | string) =>
  client.delete(buildUrl(API_CONFIG.PAYMENTS.CATEGORY_DELETE, { id }));

/* ---------- Transaction ---------- */
export const listTransactions = (params?: Record<string, any>) =>
  client.get(API_CONFIG.PAYMENTS.TRANSACTIONS_LIST, { params });

export const getTransaction = (id: string) =>
  client.get(buildUrl(API_CONFIG.PAYMENTS.TRANSACTION_DETAIL, { id }));

export const createTransaction = (data: TransactionCreate) =>
  client.post(API_CONFIG.PAYMENTS.TRANSACTION_CREATE, data);

export const updateTransaction = (id: string, data: TransactionUpdate) =>
  client.patch(buildUrl(API_CONFIG.PAYMENTS.TRANSACTION_UPDATE, { id }), data);

export const deleteTransaction = (id: string) =>
  client.delete(buildUrl(API_CONFIG.PAYMENTS.TRANSACTION_DELETE, { id }));

export const reconcileTransaction = (id: string) =>
  client.post(buildUrl(API_CONFIG.PAYMENTS.RECONCILE, { id }), {});

export const getTransactionStats = () =>
  client.get(API_CONFIG.PAYMENTS.STATISTICS);

/* ---------- Accounting-Period ---------- */
export const listAccountingPeriods = (params?: Record<string, any>) =>
  client.get(API_CONFIG.PAYMENTS.ACCOUNTING_PERIODS_LIST, { params });

export const getAccountingPeriod = (id: number | string) =>
  client.get(buildUrl(API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_DETAIL, { id }));

export const createAccountingPeriod = (data: AccountingPeriodCreate) =>
  client.post(API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_CREATE, data);

export const updateAccountingPeriod = (id: number | string, data: AccountingPeriodUpdate) =>
  client.patch(buildUrl(API_CONFIG.PAYMENTS.ACCOUNTING_PERIOD_UPDATE, { id }), data);

export const closeAccountingPeriod = (id: number | string) =>
  client.post(buildUrl(API_CONFIG.PAYMENTS.CLOSE_PERIOD, { id }), {});

export const recalculateAccountingPeriod = (id: number | string) =>
  client.post(buildUrl(API_CONFIG.PAYMENTS.RECALCULATE_PERIOD, { id }), {});