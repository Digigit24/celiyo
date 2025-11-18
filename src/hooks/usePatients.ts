// ==================== PATIENT HOOKS ====================
// Custom React hooks for Patient module using SWR
// Follows the same pattern as useDoctors.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientVitals,
  recordPatientVitals,
  getPatientAllergies,
  addPatientAllergy,
  getPatientMedicalHistory,
  addPatientMedicalHistory,
  getPatientMedications,
  addPatientMedication,
  getPatientStatistics,
} from '@/services/patient.service';
import type {
  PatientProfile,
  PatientListParams,
  PatientCreateData,
  PatientUpdateData,
  PaginatedResponse,
  PatientVitals,
  VitalsCreateData,
  PatientAllergy,
  AllergyCreateData,
  PatientMedicalHistory,
  MedicalHistoryCreateData,
  PatientMedication,
  MedicationCreateData,
  PatientStatistics,
} from '@/types/patient.types';

// ==================== PATIENT LIST HOOK ====================

/**
 * Hook to fetch list of patients with filters and pagination
 * @param params - Filter parameters (search, status, gender, etc.)
 * @returns Patient list data, loading state, error, and mutate function
 * 
 * @example
 * const { patients, count, isLoading, error, mutate } = usePatients({
 *   status: 'active',
 *   search: 'John',
 *   gender: 'male'
 * });
 */
export const usePatients = (params?: PatientListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.HMS.PATIENTS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PatientProfile>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    patients: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// ==================== SINGLE PATIENT HOOK ====================

/**
 * Hook to fetch single patient by ID
 * @param id - Patient ID
 * @returns Patient data, loading state, error, and mutate function
 * 
 * @example
 * const { patient, isLoading, error, mutate } = usePatient(123);
 */
export const usePatient = (id: number | null) => {
  const url = id ? API_CONFIG.HMS.PATIENTS.DETAIL.replace(':id', String(id)) : null;

  const { data, error, isLoading, mutate } = useSWR<PatientProfile>(
    url,
    url ? () => getPatientById(id!) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    patient: data,
    isLoading,
    error,
    mutate,
  };
};

// ==================== CREATE PATIENT HOOK ====================

/**
 * Hook to create new patient
 * @returns Trigger function, loading state, error, and data
 * 
 * @example
 * const { trigger: createNewPatient, isMutating } = useCreatePatient();
 * const newPatient = await createNewPatient(patientData);
 */
export const useCreatePatient = () => {
  const { trigger, isMutating, error, data } = useSWRMutation(
    API_CONFIG.HMS.PATIENTS.CREATE,
    (_key, { arg }: { arg: PatientCreateData }) => createPatient(arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== UPDATE PATIENT HOOK ====================

/**
 * Hook to update existing patient
 * @param id - Patient ID
 * @returns Trigger function, loading state, error, and data
 * 
 * @example
 * const { trigger: updatePatientData, isMutating } = useUpdatePatient(123);
 * const updated = await updatePatientData({ first_name: 'John' });
 */
export const useUpdatePatient = (id: number) => {
  const url = API_CONFIG.HMS.PATIENTS.UPDATE.replace(':id', String(id));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: PatientUpdateData }) => updatePatient(id, arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== DELETE PATIENT HOOK ====================

/**
 * Hook to delete patient
 * @returns Trigger function, loading state, and error
 * 
 * @example
 * const { trigger: deletePatientRecord, isMutating } = useDeletePatient();
 * await deletePatientRecord(123);
 */
export const useDeletePatient = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.HMS.PATIENTS.DELETE,
    (_key, { arg }: { arg: number }) => deletePatient(arg)
  );

  return {
    trigger,
    isMutating,
    error,
  };
};

// ==================== PATIENT VITALS HOOKS ====================

/**
 * Hook to fetch patient vitals history
 * @param patientId - Patient ID
 * @returns Vitals data, loading state, error, and mutate function
 * 
 * @example
 * const { vitals, count, isLoading, mutate } = usePatientVitals(123);
 */
export const usePatientVitals = (patientId: number | null) => {
  const url = patientId
    ? API_CONFIG.HMS.PATIENTS.VITALS_LIST.replace(':id', String(patientId))
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PatientVitals>>(
    url,
    url ? () => getPatientVitals(patientId!) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    vitals: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to record new patient vitals
 * @param patientId - Patient ID
 * @returns Trigger function, loading state, error, and data
 * 
 * @example
 * const { trigger: recordVitals, isMutating } = useRecordVitals(123);
 * const vitals = await recordVitals({ temperature: "37.5", pulse_rate: 80 });
 */
export const useRecordVitals = (patientId: number) => {
  const url = API_CONFIG.HMS.PATIENTS.RECORD_VITALS.replace(':id', String(patientId));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: VitalsCreateData }) => recordPatientVitals(patientId, arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== PATIENT ALLERGIES HOOKS ====================

/**
 * Hook to fetch patient allergies
 * @param patientId - Patient ID
 * @returns Allergies data, loading state, error, and mutate function
 */
export const usePatientAllergies = (patientId: number | null) => {
  const url = patientId
    ? API_CONFIG.HMS.PATIENTS.ALLERGIES_LIST.replace(':id', String(patientId))
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PatientAllergy>>(
    url,
    url ? () => getPatientAllergies(patientId!) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    allergies: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to add patient allergy
 * @param patientId - Patient ID
 * @returns Trigger function, loading state, error, and data
 */
export const useAddAllergy = (patientId: number) => {
  const url = API_CONFIG.HMS.PATIENTS.ADD_ALLERGY.replace(':id', String(patientId));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: AllergyCreateData }) => addPatientAllergy(patientId, arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== PATIENT MEDICAL HISTORY HOOKS ====================

/**
 * Hook to fetch patient medical history
 * @param patientId - Patient ID
 * @returns Medical history data, loading state, error, and mutate function
 */
export const usePatientMedicalHistory = (patientId: number | null) => {
  const url = patientId
    ? API_CONFIG.HMS.PATIENTS.MEDICAL_HISTORY_LIST.replace(':id', String(patientId))
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PatientMedicalHistory>>(
    url,
    url ? () => getPatientMedicalHistory(patientId!) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    medicalHistory: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to add patient medical history
 * @param patientId - Patient ID
 * @returns Trigger function, loading state, error, and data
 */
export const useAddMedicalHistory = (patientId: number) => {
  const url = API_CONFIG.HMS.PATIENTS.ADD_MEDICAL_HISTORY.replace(':id', String(patientId));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: MedicalHistoryCreateData }) =>
      addPatientMedicalHistory(patientId, arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== PATIENT MEDICATIONS HOOKS ====================

/**
 * Hook to fetch patient medications
 * @param patientId - Patient ID
 * @returns Medications data, loading state, error, and mutate function
 */
export const usePatientMedications = (patientId: number | null) => {
  const url = patientId
    ? API_CONFIG.HMS.PATIENTS.MEDICATIONS_LIST.replace(':id', String(patientId))
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PatientMedication>>(
    url,
    url ? () => getPatientMedications(patientId!) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    medications: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
};

/**
 * Hook to add patient medication
 * @param patientId - Patient ID
 * @returns Trigger function, loading state, error, and data
 */
export const useAddMedication = (patientId: number) => {
  const url = API_CONFIG.HMS.PATIENTS.ADD_MEDICATION.replace(':id', String(patientId));

  const { trigger, isMutating, error, data } = useSWRMutation(
    url,
    (_key, { arg }: { arg: MedicationCreateData }) =>
      addPatientMedication(patientId, arg)
  );

  return {
    trigger,
    isMutating,
    error,
    data,
  };
};

// ==================== PATIENT STATISTICS HOOK ====================

/**
 * Hook to fetch patient statistics (Admin only)
 * @returns Statistics data, loading state, error, and mutate function
 */
export const usePatientStatistics = () => {
  const { data, error, isLoading, mutate } = useSWR<PatientStatistics>(
    API_CONFIG.HMS.PATIENTS.STATISTICS,
    getPatientStatistics,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    statistics: data,
    isLoading,
    error,
    mutate,
  };
};