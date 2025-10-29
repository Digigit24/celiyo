// src/types/opd/opdBill.types.ts

/**
 * OPD Bill Model Type Definitions
 * Matches: opd/models.py - OPDBill Model
 * API Endpoint: /api/opd/opd-bills/
 */

export type OPDType = 'consultation' | 'follow_up' | 'emergency';

export type ChargeType = 'first_visit' | 'revisit' | 'emergency';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank' | 'multiple';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Full OPD Bill object returned from API
 */
export interface OPDBill {
  // Primary Fields
  id: number;
  bill_number: string;
  bill_date: string; // DateTimeField - auto_now_add, ISO format
  
  // Related Models (IDs)
  visit: number; // OneToOneField
  doctor: number;
  
  // Related Model Names (read-only, from serializer)
  visit_number?: string;
  patient_name?: string;
  doctor_name?: string;
  billed_by_name?: string;
  
  // Bill Classification
  opd_type: OPDType;
  opd_subtype: string; // CharField, default 'NA'
  charge_type: ChargeType;
  
  // Medical Information
  diagnosis: string; // TextField
  remarks: string; // TextField
  
  // Financial Details
  total_amount: string; // DecimalField(10, 2)
  discount_percent: string; // DecimalField(5, 2), default 0.00
  discount_amount: string; // DecimalField(10, 2), auto-calculated
  payable_amount: string; // DecimalField(10, 2), auto-calculated
  
  // Payment Details
  payment_mode: PaymentMode;
  payment_details: Record<string, any>; // JSONField, stores payment breakdown
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
 * Query parameters for listing/filtering OPD bills
 */
export interface OPDBillListParams {
  page?: number;
  page_size?: number;
  visit?: number;
  doctor?: number;
  payment_status?: PaymentStatus;
  opd_type?: OPDType;
  bill_date?: string; // YYYY-MM-DD
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Data required to create a new OPD bill
 */
export interface OPDBillCreateData {
  visit: number;
  doctor: number;
  opd_type: OPDType;
  opd_subtype?: string;
  charge_type: ChargeType;
  diagnosis?: string;
  remarks?: string;
  total_amount: string;
  discount_percent?: string;
  payment_mode?: PaymentMode;
  payment_details?: Record<string, any>;
  received_amount?: string;
}

/**
 * Data for updating an existing OPD bill
 */
export interface OPDBillUpdateData extends Partial<OPDBillCreateData> {}

/**
 * Data for recording a payment on an existing bill
 * Used with POST /opd-bills/{id}/record_payment/
 */
export interface PaymentRecordData {
  amount: string;
  payment_mode: PaymentMode;
  payment_details?: Record<string, any>;
}