// mirrors payments/models.py  &  serializers.py
export type CategoryType = 'income' | 'expense' | 'refund' | 'adjustment';
export type TransactionType = 'payment' | 'refund' | 'expense' | 'adjustment';
export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'net_banking'
  | 'online'
  | 'cheque'
  | 'insurance'
  | 'other';

export interface PaymentCategory {
  id: number;
  name: string;
  category_type: CategoryType;
  description: string | null;
}

export interface PaymentCategoryCreate {
  name: string;
  category_type: CategoryType;
  description?: string | null;
}

export interface PaymentCategoryUpdate extends Partial<PaymentCategoryCreate> {}

/* ---------- Transaction ---------- */
export interface Transaction {
  id: string; // UUID
  transaction_number: string;
  amount: string; // Decimal
  category: PaymentCategory;
  transaction_type: TransactionType;
  payment_method: PaymentMethod | null;
  user: number | null; // user-id
  user_name?: string | null; // full name
  description: string | null;
  content_type: string | null; // e.g. "order"
  object_id: number | null;
  related_object_details?: RelatedObject | null;
  is_reconciled: boolean;
  reconciled_at: string | null;
  reconciled_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number | string;
  category: number; // category-id
  transaction_type: TransactionType;
  payment_method?: PaymentMethod | null;
  user?: number | null;
  description?: string | null;
  content_type?: string | null; // app.model
  object_id?: number | null;
}

export interface TransactionUpdate extends Partial<TransactionCreate> {}

export interface RelatedObject {
  content_type: string | null;
  object_details: Record<string, any> | null;
}

/* ---------- Accounting Period ---------- */
export type PeriodType = 'monthly' | 'quarterly' | 'annual';

export interface AccountingPeriod {
  id: number;
  name: string;
  start_date: string; // ISO
  end_date: string; // ISO
  period_type: PeriodType;
  total_income: string; // Decimal
  total_expenses: string; // Decimal
  net_profit: string; // Decimal
  is_closed: boolean;
  closed_at: string | null;
  closed_by: number | null;
  closed_by_name?: string | null;
}

export interface AccountingPeriodCreate {
  name: string;
  start_date: string;
  end_date: string;
  period_type: PeriodType;
}

export interface AccountingPeriodUpdate extends Partial<AccountingPeriodCreate> {}

/* ---------- Statistics ---------- */
export interface TransactionStats {
  overall_stats: {
    total_transactions: number;
    total_amount: number;
    total_payments: number;
    total_expenses: number;
    total_refunds: number;
  };
  payment_method_breakdown: Array<{
    payment_method: string | null;
    count: number;
    total_amount: number;
  }>;
  transaction_type_breakdown: Array<{
    transaction_type: string;
    count: number;
    total_amount: number;
  }>;
}

/* ---------- Generic wrappers ---------- */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResp<T> {
  success: boolean;
  data: T;
  message?: string;
}