// ==================== PATIENT TYPES ====================
// Complete type definitions for Patient module
// Matches Django backend fields exactly (snake_case)

// ==================== ENUMS & CONSTANTS ====================
export type PatientGender = 'male' | 'female' | 'other';
export type PatientStatus = 'active' | 'inactive' | 'deceased';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

// ==================== MAIN PATIENT INTERFACE ====================
export interface PatientProfile {
  id: number;
  patient_id: string;
  user: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  age: number; // Read-only, calculated by backend
  gender: PatientGender;
  blood_group: BloodGroup | null;
  marital_status: MaritalStatus | null;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  occupation: string | null;
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_expiry_date: string | null; // ISO date string
  status: PatientStatus;
  registration_date: string; // ISO datetime string
  last_visit_date: string | null; // ISO datetime string
  notes: string | null;
  photo: string | null; // URL
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  created_by: number | null;
  updated_by: number | null;
}

// ==================== LIST FILTERS ====================
export interface PatientListParams {
  // Pagination
  page?: number;
  page_size?: number;

  // Search
  search?: string; // Search by name, patient_id, or phone

  // Filters
  status?: PatientStatus;
  gender?: PatientGender;
  blood_group?: BloodGroup;
  has_insurance?: boolean;
  city?: string;
  state?: string;

  // Age filters
  age_min?: number;
  age_max?: number;

  // Date filters
  date_from?: string; // Registration date from (YYYY-MM-DD)
  date_to?: string; // Registration date to (YYYY-MM-DD)

  // Ordering
  ordering?: string; // e.g., '-registration_date', 'last_name', 'age'

    [key: string]: string | number | boolean | undefined;
}

// ==================== CREATE/UPDATE DATA ====================
export interface PatientCreateData {
  // Required fields
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: PatientGender;
  phone: string;

  // Optional fields
  user?: number | null;
  blood_group?: BloodGroup | null;
  marital_status?: MaritalStatus | null;
  alternate_phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  occupation?: string | null;
  has_insurance?: boolean;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  insurance_expiry_date?: string | null;
  status?: PatientStatus;
  notes?: string | null;
  photo?: string | null;
}

export interface PatientUpdateData extends Partial<PatientCreateData> {
  // All fields optional for PATCH operations
}

// ==================== VITALS ====================
export interface PatientVitals {
  id: number;
  patient: number;
  visit: number | null;
  recorded_at: string; // ISO datetime
  temperature: string | null; // Decimal as string
  temperature_unit: 'celsius' | 'fahrenheit';
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: string | null; // Decimal as string
  weight: string | null; // Decimal as string
  weight_unit: 'kg' | 'lbs';
  height: string | null; // Decimal as string
  height_unit: 'cm' | 'inches';
  bmi: string | null; // Read-only calculated field
  notes: string | null;
  recorded_by: number;
  created_at: string;
  updated_at: string;
}

export interface VitalsCreateData {
  patient: number;
  visit?: number | null;
  temperature?: string | null;
  temperature_unit?: 'celsius' | 'fahrenheit';
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  pulse_rate?: number | null;
  respiratory_rate?: number | null;
  oxygen_saturation?: string | null;
  weight?: string | null;
  weight_unit?: 'kg' | 'lbs';
  height?: string | null;
  height_unit?: 'cm' | 'inches';
  notes?: string | null;
}

// ==================== ALLERGIES ====================
export interface PatientAllergy {
  id: number;
  patient: number;
  allergen: string;
  reaction: string | null;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string | null;
  diagnosed_date: string | null; // ISO date string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllergyCreateData {
  patient: number;
  allergen: string;
  reaction?: string | null;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string | null;
  diagnosed_date?: string | null;
  is_active?: boolean;
}

// ==================== MEDICAL HISTORY ====================
export interface PatientMedicalHistory {
  id: number;
  patient: number;
  condition: string;
  diagnosed_date: string | null;
  status: 'active' | 'resolved' | 'chronic';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistoryCreateData {
  patient: number;
  condition: string;
  diagnosed_date?: string | null;
  status?: 'active' | 'resolved' | 'chronic';
  notes?: string | null;
}

// ==================== MEDICATIONS ====================
export interface PatientMedication {
  id: number;
  patient: number;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribed_by: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationCreateData {
  patient: number;
  medication_name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  prescribed_by?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

// ==================== API RESPONSE WRAPPERS ====================
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

// ==================== STATISTICS ====================
export interface PatientStatistics {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
  new_patients_this_month: number;
  patients_by_gender: {
    male: number;
    female: number;
    other: number;
  };
  patients_by_age_group: {
    [key: string]: number;
  };
  patients_with_insurance: number;
}