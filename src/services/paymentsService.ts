import { hmsClient } from '@/lib/client';
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
  hmsClient.get(API_CONFIG.HMS.PAYMENTS.CATEGORIES_LIST, { params });

export const getPaymentCategory = (id: number | string) =>
  hmsClient.get(buildUrl(API_CONFIG.HMS.PAYMENTS.CATEGORY_DETAIL, { id }, 'hms'));

export const createPaymentCategory = (data: PaymentCategoryCreate) =>
  hmsClient.post(API_CONFIG.HMS.PAYMENTS.CATEGORY_CREATE, data);

export const updatePaymentCategory = (id: number | string, data: PaymentCategoryUpdate) =>
  hmsClient.patch(buildUrl(API_CONFIG.HMS.PAYMENTS.CATEGORY_UPDATE, { id }, 'hms'), data);

export const deletePaymentCategory = (id: number | string) =>
  hmsClient.delete(buildUrl(API_CONFIG.HMS.PAYMENTS.CATEGORY_DELETE, { id }, 'hms'));

/* ---------- Transaction ---------- */
export const listTransactions = (params?: Record<string, any>) =>
  hmsClient.get(API_CONFIG.HMS.PAYMENTS.TRANSACTIONS_LIST, { params });

export const getTransaction = (id: string) =>
  hmsClient.get(buildUrl(API_CONFIG.HMS.PAYMENTS.TRANSACTION_DETAIL, { id }, 'hms'));

export const createTransaction = (data: TransactionCreate) =>
  hmsClient.post(API_CONFIG.HMS.PAYMENTS.TRANSACTION_CREATE, data);

export const updateTransaction = (id: string, data: TransactionUpdate) =>
  hmsClient.patch(buildUrl(API_CONFIG.HMS.PAYMENTS.TRANSACTION_UPDATE, { id }, 'hms'), data);

export const deleteTransaction = (id: string) =>
  hmsClient.delete(buildUrl(API_CONFIG.HMS.PAYMENTS.TRANSACTION_DELETE, { id }, 'hms'));

export const reconcileTransaction = (id: string) =>
  hmsClient.post(buildUrl(API_CONFIG.HMS.PAYMENTS.RECONCILE, { id }, 'hms'), {});

export const getTransactionStats = () =>
  hmsClient.get(API_CONFIG.HMS.PAYMENTS.STATISTICS);

/* ---------- Accounting-Period ---------- */
export const listAccountingPeriods = (params?: Record<string, any>) =>
  hmsClient.get(API_CONFIG.HMS.PAYMENTS.ACCOUNTING_PERIODS_LIST, { params });

export const getAccountingPeriod = (id: number | string) =>
  hmsClient.get(buildUrl(API_CONFIG.HMS.PAYMENTS.ACCOUNTING_PERIOD_DETAIL, { id }, 'hms'));

export const createAccountingPeriod = (data: AccountingPeriodCreate) =>
  hmsClient.post(API_CONFIG.HMS.PAYMENTS.ACCOUNTING_PERIOD_CREATE, data);

export const updateAccountingPeriod = (id: number | string, data: AccountingPeriodUpdate) =>
  hmsClient.patch(buildUrl(API_CONFIG.HMS.PAYMENTS.ACCOUNTING_PERIOD_UPDATE, { id }, 'hms'), data);

export const closeAccountingPeriod = (id: number | string) =>
  hmsClient.post(buildUrl(API_CONFIG.HMS.PAYMENTS.CLOSE_PERIOD, { id }, 'hms'), {});

export const recalculateAccountingPeriod = (id: number | string) =>
  hmsClient.post(buildUrl(API_CONFIG.HMS.PAYMENTS.RECALCULATE_PERIOD, { id }, 'hms'), {});