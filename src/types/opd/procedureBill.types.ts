// src/types/opd/procedureBill.types.ts

/**
 * Procedure Bill & Bill Item Model Type Definitions
 * Matches: opd/models.py - ProcedureBill & ProcedureBillItem Models
 * API Endpoint: /api/opd/procedure-bills/
 */

export type BillType = 'hospital' | 'diagnostic' | 'external';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank' | 'multiple';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Procedure Bill Item (line item in a procedure bill)
 */
export interface ProcedureBillItem {
  // Primary Fields
  id: number;
  procedure_bill: number; // ForeignKey to ProcedureBill
  procedure: number | null; // ForeignKey to ProcedureMaster (nullable)
  
  // Read-only fields from serializer
  procedure_name?: string;
  
  // Item Details
  particular_name: string; // CharField(200) - stored even if procedure deleted
  note: string; // TextField
  quantity: number; // IntegerField, min 1, default 1
  unit_charge: string; // DecimalField(10, 2)
  amount: string; // DecimalField(10, 2), auto-calculated: quantity × unit_charge
  item_order: number; // IntegerField, default 0
}

/**
 * Full Procedure Bill object returned from API
 */
export interface ProcedureBill {
  // Primary Fields
  id: number;
  bill_number: string;
  bill_date: string; // DateTimeField - auto_now_add, ISO format
  
  // Related Models (IDs)
  visit: number;
  doctor: number;
  
  // Related Model Names (read-only, from serializer)
  visit_number?: string;
  patient_name?: string;
  doctor_name?: string;
  billed_by_name?: string;
  item_count?: number; // From serializer
  
  // Bill Classification
  bill_type: BillType;
  category: string; // CharField(50)
  
  // Items
  items: ProcedureBillItem[]; // Nested serializer
  
  // Financial Details (auto-calculated from items)
  total_amount: string; // DecimalField(10, 2) - sum of item amounts
  discount_percent: string; // DecimalField(5, 2), default 0.00
  discount_amount: string; // DecimalField(10, 2), auto-calculated
  payable_amount: string; // DecimalField(10, 2), auto-calculated
  
  // Payment Details
  payment_mode: PaymentMode;
  payment_details: Record<string, any>; // JSONField
  received_amount: string; // DecimalField(10, 2)
  balance_amount: string; // DecimalField(10, 2), auto-calculated
  payment_status: PaymentStatus; // auto-calculated
  
  // Audit Fields
  billed_by: number | null;
  
  // Timestamps
  created_at: string; // DateTimeField - auto_now_add, ISO format
  updated_at: string; // DateTimeField - auto_now, ISO format
}

/**
 * Query parameters for listing/filtering procedure bills
 */
export interface ProcedureBillListParams {
  page?: number;
  page_size?: number;
  visit?: number;
  doctor?: number;
  payment_status?: PaymentStatus;
  bill_type?: BillType;
  bill_date?: string; // YYYY-MM-DD
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Item data for creating/updating procedure bills
 */
export interface ProcedureBillItemCreateData {
  procedure?: number | null;
  particular_name?: string; // Auto-filled from procedure if not provided
  note?: string;
  quantity: number;
  unit_charge: string;
  item_order?: number;
}

/**
 * Data required to create a new procedure bill
 */
export interface ProcedureBillCreateData {
  visit: number;
  doctor: number;
  bill_type: BillType;
  category?: string;
  items: ProcedureBillItemCreateData[];
  discount_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: Record<string, any>;
  received_amount?: string;
}

/**
 * Data for updating an existing procedure bill
 */
export interface ProcedureBillUpdateData {
  items?: ProcedureBillItemCreateData[]; // Replaces all items
  discount_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: Record<string, any>;
  received_amount?: string;
}

/**
 * Data for recording a payment on an existing procedure bill
 * Used with POST /procedure-bills/{id}/record_payment/
 */
export interface PaymentRecordData {
  amount: string;
  payment_mode: PaymentMode;
  payment_details?: Record<string, any>;
}