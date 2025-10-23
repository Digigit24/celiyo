// Authentication Types

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  alternate_phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  full_address: string;
  profile_picture: string;
  bio: string;
  employee_id: string;
  department: string;
  joining_date: string;
  is_verified: boolean;
  is_active: boolean;
  role: string;
  groups: string[];
  has_doctor_profile: string;
  has_patient_profile: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse extends User {
  token?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}