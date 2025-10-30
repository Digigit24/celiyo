// src/hooks/useServices.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl, buildQueryString } from '@/lib/apiConfig';
import { postFetcher, putFetcher, deleteFetcher } from '@/lib/swrConfig';
import type {
  ServiceCategory,
  ServiceCategoryListParams,
  ServiceCategoryCreateData,
  ServiceCategoryUpdateData,
  DiagnosticTest,
  DiagnosticTestListParams,
  DiagnosticTestCreateData,
  DiagnosticTestUpdateData,
  NursingCarePackage,
  NursingCarePackageListParams,
  NursingCarePackageCreateData,
  NursingCarePackageUpdateData,
  HomeHealthcareService,
  HomeHealthcareServiceListParams,
  HomeHealthcareServiceCreateData,
  HomeHealthcareServiceUpdateData,
  PaginatedResponse,
} from '@/types/service.types';

// ==================== SERVICE CATEGORIES HOOKS ====================

// Hook to fetch service categories list with filters
export const useServiceCategories = (params?: ServiceCategoryListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.SERVICES.CATEGORIES_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<ServiceCategory>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    categories: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single service category
export const useServiceCategory = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.SERVICES.CATEGORY_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<ServiceCategory>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    category: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create service category
export const useCreateServiceCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.CATEGORY_CREATE,
    postFetcher<ServiceCategory>
  );

  return {
    createCategory: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update service category
export const useUpdateServiceCategory = (id: number | string) => {
  const url = buildUrl(API_CONFIG.SERVICES.CATEGORY_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<ServiceCategory>
  );

  return {
    updateCategory: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete service category
export const useDeleteServiceCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.CATEGORY_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteCategory: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== DIAGNOSTIC TESTS HOOKS ====================

// Hook to fetch diagnostic tests list with filters
export const useDiagnosticTests = (params?: DiagnosticTestListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.SERVICES.DIAGNOSTIC_TESTS_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<DiagnosticTest>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    diagnosticTests: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single diagnostic test
export const useDiagnosticTest = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.SERVICES.DIAGNOSTIC_TEST_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<DiagnosticTest>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    diagnosticTest: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create diagnostic test
export const useCreateDiagnosticTest = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.DIAGNOSTIC_TEST_CREATE,
    postFetcher<DiagnosticTest>
  );

  return {
    createDiagnosticTest: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update diagnostic test
export const useUpdateDiagnosticTest = (id: number | string) => {
  const url = buildUrl(API_CONFIG.SERVICES.DIAGNOSTIC_TEST_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<DiagnosticTest>
  );

  return {
    updateDiagnosticTest: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete diagnostic test
export const useDeleteDiagnosticTest = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.DIAGNOSTIC_TEST_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteDiagnosticTest: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== NURSING CARE PACKAGES HOOKS ====================

// Hook to fetch nursing care packages list with filters
export const useNursingCarePackages = (params?: NursingCarePackageListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.SERVICES.NURSING_PACKAGES_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<NursingCarePackage>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    nursingPackages: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single nursing care package
export const useNursingCarePackage = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.SERVICES.NURSING_PACKAGE_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<NursingCarePackage>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    nursingPackage: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create nursing care package
export const useCreateNursingCarePackage = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.NURSING_PACKAGE_CREATE,
    postFetcher<NursingCarePackage>
  );

  return {
    createNursingPackage: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update nursing care package
export const useUpdateNursingCarePackage = (id: number | string) => {
  const url = buildUrl(API_CONFIG.SERVICES.NURSING_PACKAGE_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<NursingCarePackage>
  );

  return {
    updateNursingPackage: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete nursing care package
export const useDeleteNursingCarePackage = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.NURSING_PACKAGE_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteNursingPackage: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== HOME HEALTHCARE SERVICES HOOKS ====================

// Hook to fetch home healthcare services list with filters
export const useHomeHealthcareServices = (params?: HomeHealthcareServiceListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.SERVICES.HOME_HEALTHCARE_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<HomeHealthcareService>>(
    url,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    homeHealthcareServices: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single home healthcare service
export const useHomeHealthcareService = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.SERVICES.HOME_HEALTHCARE_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<HomeHealthcareService>(
    url,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    homeHealthcareService: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create home healthcare service
export const useCreateHomeHealthcareService = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.HOME_HEALTHCARE_CREATE,
    postFetcher<HomeHealthcareService>
  );

  return {
    createHomeHealthcareService: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update home healthcare service
export const useUpdateHomeHealthcareService = (id: number | string) => {
  const url = buildUrl(API_CONFIG.SERVICES.HOME_HEALTHCARE_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    putFetcher<HomeHealthcareService>
  );

  return {
    updateHomeHealthcareService: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete home healthcare service
export const useDeleteHomeHealthcareService = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.SERVICES.HOME_HEALTHCARE_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteHomeHealthcareService: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== UTILITY HOOKS ====================

// Hook to fetch all active service categories (utility)
export const useActiveServiceCategories = () => {
  return useServiceCategories({ is_active: true, page_size: 100 });
};

// Hook to fetch all active diagnostic tests (utility)
export const useActiveDiagnosticTests = () => {
  return useDiagnosticTests({ is_active: true, page_size: 100 });
};

// Hook to fetch all active nursing packages (utility)
export const useActiveNursingPackages = () => {
  return useNursingCarePackages({ is_active: true, page_size: 100 });
};

// Hook to fetch all active home healthcare services (utility)
export const useActiveHomeHealthcareServices = () => {
  return useHomeHealthcareServices({ is_active: true, page_size: 100 });
};

// Hook to fetch diagnostic tests by category
export const useDiagnosticTestsByCategory = (categoryId: number | null) => {
  return useDiagnosticTests(
    categoryId ? { category: categoryId, page_size: 100 } : undefined
  );
};

// Hook to fetch nursing packages by category
export const useNursingPackagesByCategory = (categoryId: number | null) => {
  return useNursingCarePackages(
    categoryId ? { category: categoryId, page_size: 100 } : undefined
  );
};

// Hook to fetch home healthcare services by category
export const useHomeHealthcareServicesByCategory = (categoryId: number | null) => {
  return useHomeHealthcareServices(
    categoryId ? { category: categoryId, page_size: 100 } : undefined
  );
};

// Hook to fetch featured services across all types
export const useFeaturedServices = () => {
  const { diagnosticTests: featuredDiagnostic } = useDiagnosticTests({ 
    is_featured: true, 
    is_active: true,
    page_size: 10 
  });
  
  const { nursingPackages: featuredNursing } = useNursingCarePackages({ 
    is_featured: true, 
    is_active: true,
    page_size: 10 
  });
  
  const { homeHealthcareServices: featuredHomecare } = useHomeHealthcareServices({ 
    is_featured: true, 
    is_active: true,
    page_size: 10 
  });

  return {
    featuredDiagnostic,
    featuredNursing,
    featuredHomecare,
    allFeatured: [
      ...featuredDiagnostic,
      ...featuredNursing,
      ...featuredHomecare,
    ],
  };
};