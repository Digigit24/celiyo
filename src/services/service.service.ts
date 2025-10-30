// src/services/service.service.ts
import apiClient from '@/api/client';
import { API_CONFIG } from '@/lib/apiConfig';
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
  ApiResponse,
} from '@/types/service.types';

// ==================== SERVICE CATEGORIES ====================

// List Service Categories with filters
export const getServiceCategories = async (
  params?: ServiceCategoryListParams
): Promise<PaginatedResponse<ServiceCategory>> => {
  const response = await apiClient.get(API_CONFIG.SERVICES.CATEGORIES_LIST, { params });
  return response.data;
};

// Get single Service Category by ID
export const getServiceCategoryById = async (id: number): Promise<ServiceCategory> => {
  const url = API_CONFIG.SERVICES.CATEGORY_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<ServiceCategory>(url);
  return response.data;
};

// Create new Service Category
export const createServiceCategory = async (
  data: ServiceCategoryCreateData
): Promise<ServiceCategory> => {
  // Handle file upload if icon is a File
  let requestData: any = data;
  
  if (data.icon instanceof File) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    formData.append('icon', data.icon);
    requestData = formData;
  }
  
  const response = await apiClient.post<ServiceCategory>(
    API_CONFIG.SERVICES.CATEGORY_CREATE,
    requestData,
    data.icon instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Update Service Category
export const updateServiceCategory = async (
  id: number,
  data: ServiceCategoryUpdateData
): Promise<ServiceCategory> => {
  const url = API_CONFIG.SERVICES.CATEGORY_UPDATE.replace(':id', String(id));
  
  // Handle file upload if icon is a File
  let requestData: any = data;
  
  if (data.icon instanceof File) {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.type) formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    formData.append('icon', data.icon);
    requestData = formData;
  }
  
  const response = await apiClient.patch<ServiceCategory>(
    url,
    requestData,
    data.icon instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Delete Service Category
export const deleteServiceCategory = async (id: number): Promise<void> => {
  const url = API_CONFIG.SERVICES.CATEGORY_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};

// ==================== DIAGNOSTIC TESTS ====================

// List Diagnostic Tests with filters
export const getDiagnosticTests = async (
  params?: DiagnosticTestListParams
): Promise<PaginatedResponse<DiagnosticTest>> => {
  const response = await apiClient.get(API_CONFIG.SERVICES.DIAGNOSTIC_TESTS_LIST, { params });
  return response.data;
};

// Get single Diagnostic Test by ID
export const getDiagnosticTestById = async (id: number): Promise<DiagnosticTest> => {
  const url = API_CONFIG.SERVICES.DIAGNOSTIC_TEST_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<DiagnosticTest>(url);
  return response.data;
};

// Get Diagnostic Tests by Category ID - with client-side filtering as fallback
export const getDiagnosticTestsByCategory = async (categoryId: number): Promise<DiagnosticTest[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<DiagnosticTest>>(
      API_CONFIG.SERVICES.DIAGNOSTIC_TESTS_LIST,
      { 
        params: { 
          category: categoryId,
          page_size: 100
        } 
      }
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching diagnostic tests by category:', error);
    throw error;
  }
};

// Create new Diagnostic Test
export const createDiagnosticTest = async (
  data: DiagnosticTestCreateData
): Promise<DiagnosticTest> => {
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('code', data.code);
    formData.append('base_price', String(data.base_price));
    formData.append('category_id', String(data.category_id));
    formData.append('sample_type', data.sample_type);
    formData.append('typical_turnaround_time', String(data.typical_turnaround_time));
    
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.is_home_collection !== undefined) formData.append('is_home_collection', String(data.is_home_collection));
    if (data.home_collection_fee) formData.append('home_collection_fee', String(data.home_collection_fee));
    if (data.preparation_instructions) formData.append('preparation_instructions', data.preparation_instructions);
    if (data.reporting_type) formData.append('reporting_type', data.reporting_type);
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.post<DiagnosticTest>(
    API_CONFIG.SERVICES.DIAGNOSTIC_TEST_CREATE,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Update Diagnostic Test
export const updateDiagnosticTest = async (
  id: number,
  data: DiagnosticTestUpdateData
): Promise<DiagnosticTest> => {
  const url = API_CONFIG.SERVICES.DIAGNOSTIC_TEST_UPDATE.replace(':id', String(id));
  
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.code) formData.append('code', data.code);
    if (data.base_price) formData.append('base_price', String(data.base_price));
    if (data.category_id) formData.append('category_id', String(data.category_id));
    if (data.sample_type) formData.append('sample_type', data.sample_type);
    if (data.typical_turnaround_time) formData.append('typical_turnaround_time', String(data.typical_turnaround_time));
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price !== undefined) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.is_home_collection !== undefined) formData.append('is_home_collection', String(data.is_home_collection));
    if (data.home_collection_fee !== undefined) formData.append('home_collection_fee', String(data.home_collection_fee));
    if (data.preparation_instructions) formData.append('preparation_instructions', data.preparation_instructions);
    if (data.reporting_type) formData.append('reporting_type', data.reporting_type);
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.patch<DiagnosticTest>(
    url,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Delete Diagnostic Test
export const deleteDiagnosticTest = async (id: number): Promise<void> => {
  const url = API_CONFIG.SERVICES.DIAGNOSTIC_TEST_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};

// ==================== NURSING CARE PACKAGES ====================

// List Nursing Care Packages with filters
export const getNursingCarePackages = async (
  params?: NursingCarePackageListParams
): Promise<PaginatedResponse<NursingCarePackage>> => {
  const response = await apiClient.get(API_CONFIG.SERVICES.NURSING_PACKAGES_LIST, { params });
  return response.data;
};

// Get single Nursing Care Package by ID
export const getNursingCarePackageById = async (id: number): Promise<NursingCarePackage> => {
  const url = API_CONFIG.SERVICES.NURSING_PACKAGE_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<NursingCarePackage>(url);
  return response.data;
};

// Get Nursing Care Packages by Category ID
export const getNursingCarePackagesByCategory = async (
  categoryId: number
): Promise<NursingCarePackage[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<NursingCarePackage>>(
      API_CONFIG.SERVICES.NURSING_PACKAGES_LIST,
      { 
        params: { 
          category: categoryId,
          page_size: 100
        } 
      }
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching nursing packages by category:', error);
    throw error;
  }
};

// Create new Nursing Care Package
export const createNursingCarePackage = async (
  data: NursingCarePackageCreateData
): Promise<NursingCarePackage> => {
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('code', data.code);
    formData.append('base_price', String(data.base_price));
    formData.append('category_id', String(data.category_id));
    formData.append('package_type', data.package_type);
    formData.append('max_duration', String(data.max_duration));
    
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.included_services) formData.append('included_services', JSON.stringify(data.included_services));
    if (data.target_group) formData.append('target_group', data.target_group);
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.post<NursingCarePackage>(
    API_CONFIG.SERVICES.NURSING_PACKAGE_CREATE,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Update Nursing Care Package
export const updateNursingCarePackage = async (
  id: number,
  data: NursingCarePackageUpdateData
): Promise<NursingCarePackage> => {
  const url = API_CONFIG.SERVICES.NURSING_PACKAGE_UPDATE.replace(':id', String(id));
  
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.code) formData.append('code', data.code);
    if (data.base_price) formData.append('base_price', String(data.base_price));
    if (data.category_id) formData.append('category_id', String(data.category_id));
    if (data.package_type) formData.append('package_type', data.package_type);
    if (data.max_duration) formData.append('max_duration', String(data.max_duration));
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price !== undefined) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.included_services) formData.append('included_services', JSON.stringify(data.included_services));
    if (data.target_group) formData.append('target_group', data.target_group);
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.patch<NursingCarePackage>(
    url,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Delete Nursing Care Package
export const deleteNursingCarePackage = async (id: number): Promise<void> => {
  const url = API_CONFIG.SERVICES.NURSING_PACKAGE_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};

// ==================== HOME HEALTHCARE SERVICES ====================

// List Home Healthcare Services with filters
export const getHomeHealthcareServices = async (
  params?: HomeHealthcareServiceListParams
): Promise<PaginatedResponse<HomeHealthcareService>> => {
  const response = await apiClient.get(API_CONFIG.SERVICES.HOME_HEALTHCARE_LIST, { params });
  return response.data;
};

// Get single Home Healthcare Service by ID
export const getHomeHealthcareServiceById = async (id: number): Promise<HomeHealthcareService> => {
  const url = API_CONFIG.SERVICES.HOME_HEALTHCARE_DETAIL.replace(':id', String(id));
  const response = await apiClient.get<HomeHealthcareService>(url);
  return response.data;
};

// Get Home Healthcare Services by Category ID
export const getHomeHealthcareServicesByCategory = async (
  categoryId: number
): Promise<HomeHealthcareService[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<HomeHealthcareService>>(
      API_CONFIG.SERVICES.HOME_HEALTHCARE_LIST,
      { 
        params: { 
          category: categoryId,
          page_size: 100
        } 
      }
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching home healthcare services by category:', error);
    throw error;
  }
};

// Create new Home Healthcare Service
export const createHomeHealthcareService = async (
  data: HomeHealthcareServiceCreateData
): Promise<HomeHealthcareService> => {
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('code', data.code);
    formData.append('base_price', String(data.base_price));
    formData.append('category_id', String(data.category_id));
    formData.append('service_type', data.service_type);
    formData.append('staff_type_required', data.staff_type_required);
    
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.equipment_needed) formData.append('equipment_needed', data.equipment_needed);
    if (data.max_distance_km) formData.append('max_distance_km', String(data.max_distance_km));
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.post<HomeHealthcareService>(
    API_CONFIG.SERVICES.HOME_HEALTHCARE_CREATE,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Update Home Healthcare Service
export const updateHomeHealthcareService = async (
  id: number,
  data: HomeHealthcareServiceUpdateData
): Promise<HomeHealthcareService> => {
  const url = API_CONFIG.SERVICES.HOME_HEALTHCARE_UPDATE.replace(':id', String(id));
  
  // Handle file upload if image is a File
  let requestData: any = { ...data };
  
  if (data.image instanceof File) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.code) formData.append('code', data.code);
    if (data.base_price) formData.append('base_price', String(data.base_price));
    if (data.category_id) formData.append('category_id', String(data.category_id));
    if (data.service_type) formData.append('service_type', data.service_type);
    if (data.staff_type_required) formData.append('staff_type_required', data.staff_type_required);
    if (data.description) formData.append('description', data.description);
    if (data.discounted_price !== undefined) formData.append('discounted_price', String(data.discounted_price));
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.equipment_needed) formData.append('equipment_needed', data.equipment_needed);
    if (data.max_distance_km !== undefined) formData.append('max_distance_km', String(data.max_distance_km));
    
    formData.append('image', data.image);
    requestData = formData;
  }
  
  const response = await apiClient.patch<HomeHealthcareService>(
    url,
    requestData,
    data.image instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  );
  return response.data;
};

// Delete Home Healthcare Service
export const deleteHomeHealthcareService = async (id: number): Promise<void> => {
  const url = API_CONFIG.SERVICES.HOME_HEALTHCARE_DELETE.replace(':id', String(id));
  await apiClient.delete(url);
};