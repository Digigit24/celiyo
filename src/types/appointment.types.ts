// Appointment Types - Matching Django Backend Exactly

// Enums matching Django choices
export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'checked_in' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type AppointmentPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent';

// Nested types from backend
export interface PatientProfileList {
  id: number;
  patient_id: string;
  full_name: string;
  mobile_primary: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
}

export interface DoctorProfileList {
  id: number;
  full_name: string;
  medical_license_number: string;
  specialties?: string[];
  consultation_fee?: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  description?: string;
  duration_default: number;
  base_consultation_fee?: string;
}

// Main Appointment interface (List view)
export interface AppointmentList {
  id: number;
  appointment_id: string;
  patient: PatientProfileList;
  doctor: DoctorProfileList;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  status_display: string;
  priority: AppointmentPriority;
  priority_display: string;
  consultation_fee: string;
  is_follow_up: boolean;
  chief_complaint?: string;
  symptoms?: string;
  notes?: string;
  check_in_time?: string;
  checked_in_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  waiting_time_minutes?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Detail view (expanded nested objects)
export interface AppointmentDetail {
  id: number;
  appointment_id: string;
  patient: PatientProfileList;
  doctor: DoctorProfileList;
  appointment_type: AppointmentType;
  appointment_date: string;
  appointment_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  status_display: string;
  priority: AppointmentPriority;
  priority_display: string;
  chief_complaint?: string;
  symptoms?: string;
  notes?: string;
  is_follow_up: boolean;
  original_appointment?: number;
  consultation_fee: string;
  visit?: number;
  visit_number?: string;
  check_in_time?: string;
  checked_in_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  waiting_time_minutes?: number;
  cancelled_at?: string;
  cancelled_by_name?: string;
  cancellation_reason?: string;
  approved_at?: string;
  approved_by_name?: string;
  created_at: string;
  created_by_name?: string;
  updated_at: string;
}

// Create/Update payloads
export interface AppointmentCreateData {
  patient_id: number;
  doctor_id: number;
  appointment_type_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS
  duration_minutes?: number;
  chief_complaint?: string;
  symptoms?: string;
  priority?: AppointmentPriority;
  notes?: string;
  is_follow_up?: boolean;
  original_appointment?: number;
}

export interface AppointmentUpdateData {
  patient_id?: number;
  doctor_id?: number;
  appointment_type_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  chief_complaint?: string;
  symptoms?: string;
  notes?: string;
  cancellation_reason?: string;
}

// Filter/Query params
export interface AppointmentListParams {
  page?: number;
  page_size?: number;
  doctor_id?: number;
  patient_id?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  search?: string;
  ordering?: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Action response types
export interface CheckInResponse {
  status: AppointmentStatus;
  checked_in_at: string;
}

export interface StartResponse {
  status: AppointmentStatus;
  actual_start_time: string;
}

export interface CompleteResponse {
  status: AppointmentStatus;
  actual_end_time: string;
}

export interface CancelData {
  cancellation_reason: string;
}

export interface CancelResponse {
  status: AppointmentStatus;
  cancelled_at: string;
}