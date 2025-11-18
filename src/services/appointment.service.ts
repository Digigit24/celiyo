import { hmsClient } from '@/lib/client';
import { API_CONFIG } from '@/lib/apiConfig';
import type {
  AppointmentList,
  AppointmentDetail,
  AppointmentCreateData,
  AppointmentUpdateData,
  AppointmentListParams,
  PaginatedResponse,
  ApiResponse,
  CheckInResponse,
  StartResponse,
  CompleteResponse,
  CancelData,
  CancelResponse,
} from '@/types/appointment.types';

// LIST appointments with filters
export const getAppointments = async (
  params?: AppointmentListParams
): Promise<PaginatedResponse<AppointmentList>> => {
  const response = await hmsClient.get<PaginatedResponse<AppointmentList>>(
    API_CONFIG.HMS.APPOINTMENTS.LIST,
    { params }
  );
  return response.data;
};

// GET single appointment by ID
export const getAppointmentById = async (
  id: number
): Promise<AppointmentDetail> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.DETAIL.replace(':id', String(id));
  const response = await hmsClient.get<AppointmentDetail>(url);
  return response.data;
};

// CREATE new appointment
export const createAppointment = async (
  data: AppointmentCreateData
): Promise<AppointmentDetail> => {
  const response = await hmsClient.post<ApiResponse<AppointmentDetail>>(
    API_CONFIG.HMS.APPOINTMENTS.CREATE,
    data
  );
  return response.data.data;
};

// UPDATE appointment (PATCH)
export const updateAppointment = async (
  id: number,
  data: AppointmentUpdateData
): Promise<AppointmentDetail> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.UPDATE.replace(':id', String(id));
  const response = await hmsClient.patch<ApiResponse<AppointmentDetail>>(
    url,
    data
  );
  return response.data.data;
};

// DELETE appointment (soft cancel)
export const deleteAppointment = async (
  id: number,
  cancellation_reason?: string
): Promise<void> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.DELETE.replace(':id', String(id));
  await hmsClient.delete(url, {
    data: { cancellation_reason },
  });
};

// CHECK-IN appointment
export const checkInAppointment = async (
  id: number
): Promise<AppointmentDetail> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.CHECK_IN.replace(':id', String(id));
  const response = await hmsClient.post<ApiResponse<AppointmentDetail>>(url);
  return response.data.data;
};

// START consultation
export const startAppointment = async (
  id: number
): Promise<AppointmentDetail> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.START.replace(':id', String(id));
  const response = await hmsClient.post<ApiResponse<AppointmentDetail>>(url);
  return response.data.data;
};

// COMPLETE consultation
export const completeAppointment = async (
  id: number
): Promise<AppointmentDetail> => {
  const url = API_CONFIG.HMS.APPOINTMENTS.COMPLETE.replace(':id', String(id));
  const response = await hmsClient.post<ApiResponse<AppointmentDetail>>(url);
  return response.data.data;
};

// GET today's appointments
export const getTodayAppointments = async (): Promise<AppointmentList[]> => {
  const response = await hmsClient.get<ApiResponse<AppointmentList[]>>(
    API_CONFIG.HMS.APPOINTMENTS.TODAY
  );
  return response.data.data;
};

// GET upcoming appointments
export const getUpcomingAppointments = async (): Promise<AppointmentList[]> => {
  const response = await hmsClient.get<ApiResponse<AppointmentList[]>>(
    API_CONFIG.HMS.APPOINTMENTS.UPCOMING
  );
  return response.data.data;
};