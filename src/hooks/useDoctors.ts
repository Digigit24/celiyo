import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG } from '@/lib/apiConfig';
import type {
  Doctor,
  DoctorListParams,
  DoctorCreateData,
  DoctorUpdateData,
  SetAvailabilityData,
  Specialty,
  DoctorAvailability,
  PaginatedResponse,
} from '@/types/doctor.types';
import * as doctorService from '@/services/doctor.service';

// Hook to fetch all doctors with filters
export const useDoctors = (params?: DoctorListParams) => {
  const key = params 
    ? [API_CONFIG.DOCTORS.PROFILES_LIST, params] 
    : API_CONFIG.DOCTORS.PROFILES_LIST;
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Doctor>>(
    key,
    () => doctorService.getDoctors(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
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

// Hook to fetch single doctor by ID
export const useDoctor = (id: number | null) => {
  const key = id ? `${API_CONFIG.DOCTORS.PROFILE_DETAIL.replace(':id', String(id))}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<Doctor>(
    key,
    () => doctorService.getDoctorById(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    doctor: data,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create doctor
export const useCreateDoctor = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.DOCTORS.REGISTER,
    async (_key: string, { arg }: { arg: DoctorCreateData }) => {
      return await doctorService.createDoctor(arg);
    }
  );

  return {
    createDoctor: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update doctor
export const useUpdateDoctor = (id: number) => {
  const key = API_CONFIG.DOCTORS.PROFILE_UPDATE.replace(':id', String(id));
  
  const { trigger, isMutating, error } = useSWRMutation(
    key,
    async (_key: string, { arg }: { arg: DoctorUpdateData }) => {
      return await doctorService.updateDoctor(id, arg);
    }
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
    async (_key: string, { arg }: { arg: number }) => {
      return await doctorService.deleteDoctor(arg);
    }
  );

  return {
    deleteDoctor: trigger,
    isDeleting: isMutating,
    error,
  };
};

// Hook to fetch doctor availability
export const useDoctorAvailability = (doctorId: number | null) => {
  const key = doctorId 
    ? API_CONFIG.DOCTORS.AVAILABILITY_LIST.replace(':id', String(doctorId))
    : null;
  
  const { data, error, isLoading, mutate } = useSWR<DoctorAvailability[]>(
    key,
    () => doctorService.getDoctorAvailability(doctorId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    availability: data || [],
    isLoading,
    error,
    mutate,
  };
};

// Hook to set doctor availability
export const useSetDoctorAvailability = (doctorId: number) => {
  const key = API_CONFIG.DOCTORS.AVAILABILITY_CREATE.replace(':id', String(doctorId));
  
  const { trigger, isMutating, error } = useSWRMutation(
    key,
    async (_key: string, { arg }: { arg: SetAvailabilityData }) => {
      return await doctorService.setDoctorAvailability(doctorId, arg);
    }
  );

  return {
    setAvailability: trigger,
    isSetting: isMutating,
    error,
  };
};

// Hook to fetch doctor statistics
export const useDoctorStatistics = () => {
  const { data, error, isLoading, mutate } = useSWR(
    API_CONFIG.DOCTORS.STATISTICS,
    doctorService.getDoctorStatistics,
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

// Hook to fetch all specialties
export const useSpecialties = () => {
  const { data, error, isLoading, mutate } = useSWR<Specialty[]>(
    API_CONFIG.DOCTORS.SPECIALTIES_LIST,
    doctorService.getSpecialties,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    specialties: data || [],
    isLoading,
    error,
    mutate,
  };
};

// Hook to create specialty
export const useCreateSpecialty = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.DOCTORS.SPECIALTY_CREATE,
    async (_key: string, { arg }: { arg: Partial<Specialty> }) => {
      return await doctorService.createSpecialty(arg);
    }
  );

  return {
    createSpecialty: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update specialty
export const useUpdateSpecialty = (id: number) => {
  const key = API_CONFIG.DOCTORS.SPECIALTY_UPDATE.replace(':id', String(id));
  
  const { trigger, isMutating, error } = useSWRMutation(
    key,
    async (_key: string, { arg }: { arg: Partial<Specialty> }) => {
      return await doctorService.updateSpecialty(id, arg);
    }
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
    API_CONFIG.DOCTORS.SPECIALTY_DELETE,
    async (_key: string, { arg }: { arg: number }) => {
      return await doctorService.deleteSpecialty(arg);
    }
  );

  return {
    deleteSpecialty: trigger,
    isDeleting: isMutating,
    error,
  };
};