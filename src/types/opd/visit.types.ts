// src/types/opd/visit.types.ts

import type { ApiResponse, PaginatedResponse } from './common.types';

/**
 * Visit Model Type Definitions
 * Matches: opd/models.py - Visit Model
 * API Endpoint: /api/opd/visits/
 */

export type VisitType = 'new' | 'follow_up' | 'emergency';

export type VisitStatus = 
  | 'waiting' 
  | 'called' 
  | 'in_consultation' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Full Visit object returned from API
 */
export interface Visit {
  // Primary Fields
  id: number;
  visit_number: string;
  
  // Related Models (IDs)
  patient: number;
  doctor: number | null;
  appointment: number | null;
  referred_by: number | null;
  created_by: number | null;
  
  // Related Model Names (read-only, from serializer)
  patient_name?: string;
  patient_id?: string;
  doctor_name?: string;
  referred_by_name?: string;
  created_by_name?: string;
  
  // Detailed Related Objects (from VisitDetailSerializer)
  patient_details?: {
    patient_id: string;
    full_name: string;
    age: number;
    gender: string;
    blood_group: string;
    mobile: string;
  };
  
  doctor_details?: {
    id: number;
    full_name: string;
    specialties: string[];
    consultation_fee: string;
    follow_up_fee: string;
  };
  
  // Visit Information
  visit_date: string; // DateField - auto_now_add, format: YYYY-MM-DD
  visit_type: VisitType;
  entry_time: string; // DateTimeField - auto_now_add, ISO format
  is_follow_up: boolean;
  
  // Queue Management
  status: VisitStatus;
  queue_position: number | null;
  
  // Consultation Timing
  consultation_start_time: string | null; // DateTimeField, ISO format
  consultation_end_time: string | null; // DateTimeField, ISO format
  
  // Payment Information
  payment_status: PaymentStatus;
  total_amount: string; // DecimalField(10, 2)
  paid_amount: string; // DecimalField(10, 2)
  balance_amount: string; // DecimalField(10, 2)
  
  // Computed Fields (from serializer methods)
  waiting_time?: number | null; // in minutes
  has_opd_bill?: boolean;
  has_clinical_note?: boolean;
  
  // Timestamps
  created_at: string; // DateTimeField - auto_now_add, ISO format
  updated_at: string; // DateTimeField - auto_now, ISO format
}

/**
 * Query parameters for listing/filtering visits
 */
export interface VisitListParams {
  page?: number;
  page_size?: number;
  patient?: number;
  doctor?: number;
  status?: VisitStatus;
  payment_status?: PaymentStatus;
  visit_type?: VisitType;
  visit_date?: string; // YYYY-MM-DD
  search?: string; // Searches: visit_number, patient__first_name, patient__last_name
  ordering?: string; // Available: visit_date, entry_time, queue_position, total_amount
  [key: string]: string | number | boolean | undefined;
}

/**
 * Data required to create a new visit
 */
export interface VisitCreateData {
  patient: number;
  doctor?: number;
  appointment?: number;
  visit_type: VisitType;
  is_follow_up?: boolean;
  referred_by?: number;
  status?: VisitStatus;
  queue_position?: number;
}

/**
 * Data for updating an existing visit
 */
export interface VisitUpdateData extends Partial<VisitCreateData> {}

/**
 * Visit statistics response from /visits/statistics/ endpoint
 */
export interface VisitStatistics {
  total_visits: number;
  waiting: number;
  in_consultation: number;
  completed: number;
  cancelled: number;
  no_show: number;
  total_revenue: string; // Decimal
  pending_amount: string; // Decimal
}

/**
 * Queue status response from /visits/queue/ endpoint
 */
export interface QueueStatus {
  waiting: Visit[];
  called: Visit[];
  in_consultation: Visit[];
}