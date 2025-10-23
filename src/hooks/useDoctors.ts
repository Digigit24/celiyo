// src/hooks/useDoctors.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl, buildQueryString } from '@/lib/apiConfig';
import { postFetcher, putFetcher, deleteFetcher } from '@/lib/swrConfig';

// Types
export interface DoctorProfile {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  medical_license_number: string;
  license_issuing_authority: string;
  license_issue_date: string;
  license_expiry_date: string;
  qualifications: string;
  specialties: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  years_of_experience: number;
  consultation_fee: string;
  consultation_duration: number;
  is_available_online: boolean;
  is_available_offline: boolean;
  is_verified: boolean;
  languages_spoken: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorsListParams {
  search?: string;
  specialty?: string;
  is_available?: boolean;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface DoctorsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DoctorProfile[];
}

// Hook to fetch doctors list with filters
export const useDoctors = (params?: DoctorsListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.DOCTORS.PROFILES_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<DoctorsListResponse>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    doctors: data?.results || [],
    totalCount: data?.count || 0,
    nextPage: data?.next,
    previousPage: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single doctor
export const useDoctor = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.DOCTORS.PROFILE_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<DoctorProfile>(
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
    API_CONFIG.DOCTORS.PROFILE_CREATE,
    postFetcher<DoctorProfile>
  );

  return {
    createDoctor: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update doctor
export const useUpdateDoctor = (id: number | string) => {
  const url = buildUrl(API_CONFIG.DOCTORS.PROFILE_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<DoctorProfile>
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
    API_CONFIG.DOCTORS.PROFILE_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteDoctor: trigger,
    isDeleting: isMutating,
    error,
  };
};

// Hook to fetch specialties
export const useSpecialties = () => {
  const { data, error, isLoading } = useSWR(
    API_CONFIG.DOCTORS.SPECIALTIES_LIST,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    specialties: data || [],
    isLoading,
    error,
  };
};