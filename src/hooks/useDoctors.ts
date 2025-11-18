// src/hooks/useDoctors.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl, buildQueryString } from '@/lib/apiConfig';
import { postFetcher, putFetcher, deleteFetcher } from '@/lib/swrConfig';
import type {
  Doctor,
  DoctorListParams,
  DoctorCreateData,
  DoctorUpdateData,
  Specialty,
  PaginatedResponse,
  ApiResponse,
} from '@/types/doctor.types';
import type { SpecialtyListParams } from '@/types/specialty.types';

// ==================== DOCTORS HOOKS ====================

// Hook to fetch doctors list with filters
export const useDoctors = (params?: DoctorListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.HMS.DOCTORS.PROFILES_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Doctor>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    doctors: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single doctor
export const useDoctor = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.HMS.DOCTORS.PROFILE_DETAIL, { id }, 'hms') : null;

  const { data, error, isLoading, mutate } = useSWR<Doctor>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    doctor: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create doctor
export const useCreateDoctor = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    buildUrl(API_CONFIG.HMS.DOCTORS.PROFILE_CREATE, undefined, 'hms'),
    postFetcher<Doctor>
  );

  return {
    createDoctor: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update doctor
export const useUpdateDoctor = (id: number | string) => {
  const url = buildUrl(API_CONFIG.HMS.DOCTORS.PROFILE_UPDATE, { id }, 'hms');

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<Doctor>
  );

  return {
    updateDoctor: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete doctor
export const useDeleteDoctor = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.HMS.DOCTORS.PROFILE_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id }, 'hms');
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteDoctor: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== SPECIALTIES HOOKS ====================

// Hook to fetch all specialties with filters
export const useSpecialties = (params?: SpecialtyListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.HMS.DOCTORS.SPECIALTIES_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Specialty>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    specialties: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single specialty
export const useSpecialty = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.HMS.DOCTORS.SPECIALTY_DETAIL, { id }, 'hms') : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Specialty>>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    specialty: data?.data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create specialty
export const useCreateSpecialty = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    buildUrl(API_CONFIG.HMS.DOCTORS.SPECIALTY_CREATE, undefined, 'hms'),
    postFetcher<Specialty>
  );

  return {
    createSpecialty: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update specialty
export const useUpdateSpecialty = (id: number | string) => {
  const url = buildUrl(API_CONFIG.HMS.DOCTORS.SPECIALTY_UPDATE, { id }, 'hms');

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<Specialty>
  );

  return {
    updateSpecialty: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete specialty
export const useDeleteSpecialty = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.HMS.DOCTORS.SPECIALTY_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id }, 'hms');
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteSpecialty: trigger,
    isDeleting: isMutating,
    error,
  };
};