// src/services/opd/visitAttachment.service.ts
import apiClient from '@/api/client';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import type {
  VisitAttachment,
  VisitAttachmentCreateData,
  VisitAttachmentUpdateData,
  VisitAttachmentListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/opd.types';

// ==================== VISIT ATTACHMENTS ====================

export const getVisitAttachments = async (
  params?: VisitAttachmentListParams
): Promise<PaginatedResponse<VisitAttachment>> => {
  const response = await apiClient.get(OPD_API_CONFIG.VISIT_ATTACHMENTS.LIST, {
    params,
  });
  return response.data;
};

export const getVisitAttachmentById = async (
  id: number
): Promise<VisitAttachment> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_ATTACHMENTS.DETAIL, { id });
  const response = await apiClient.get<ApiResponse<VisitAttachment>>(url);
  return response.data.data;
};

export const createVisitAttachment = async (
  data: VisitAttachmentCreateData
): Promise<VisitAttachment> => {
  const formData = new FormData();
  formData.append('visit', String(data.visit));
  formData.append('file', data.file);
  formData.append('file_type', data.file_type);
  if (data.description) {
    formData.append('description', data.description);
  }

  const response = await apiClient.post<ApiResponse<VisitAttachment>>(
    OPD_API_CONFIG.VISIT_ATTACHMENTS.CREATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const updateVisitAttachment = async (
  id: number,
  data: VisitAttachmentUpdateData
): Promise<VisitAttachment> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_ATTACHMENTS.UPDATE, { id });
  const response = await apiClient.patch<ApiResponse<VisitAttachment>>(
    url,
    data
  );
  return response.data.data;
};

export const deleteVisitAttachment = async (id: number): Promise<void> => {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_ATTACHMENTS.DELETE, { id });
  await apiClient.delete(url);
};