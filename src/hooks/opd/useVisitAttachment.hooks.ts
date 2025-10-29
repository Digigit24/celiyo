// src/hooks/opd/useVisitAttachment.hooks.ts

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { OPD_API_CONFIG, buildOPDUrl } from '@/lib/apiConfig';
import {
  getVisitAttachments,
  getVisitAttachmentById,
  createVisitAttachment,
  updateVisitAttachment,
  deleteVisitAttachment,
} from '@/services/opd/visitAttachment.service';
import { DEFAULT_SWR_OPTIONS, buildQueryString } from './common.hooks';
import type {
  VisitAttachment,
  VisitAttachmentListParams,
  VisitAttachmentCreateData,
  VisitAttachmentUpdateData,
  PaginatedResponse,
} from '@/types/opd';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated visit attachments with filters
 * 
 * @example
 * const { visitAttachments, count, isLoading } = useVisitAttachments({ 
 *   visit: 123,
 *   file_type: 'xray' 
 * });
 */
export function useVisitAttachments(params?: VisitAttachmentListParams) {
  const queryString = buildQueryString(params);
  const url = `${OPD_API_CONFIG.VISIT_ATTACHMENTS.LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<VisitAttachment>
  >(url, () => getVisitAttachments(params), DEFAULT_SWR_OPTIONS);

  return {
    visitAttachments: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single visit attachment by ID
 * 
 * @example
 * const { visitAttachment, isLoading, mutate } = useVisitAttachment(123);
 */
export function useVisitAttachment(id: number | null) {
  const url = id
    ? buildOPDUrl(OPD_API_CONFIG.VISIT_ATTACHMENTS.DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<VisitAttachment>(
    url,
    () => (id ? getVisitAttachmentById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    visitAttachment: data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch attachments for a specific visit
 * 
 * @example
 * const { attachments, count, isLoading } = useAttachmentsByVisit(123);
 */
export function useAttachmentsByVisit(visitId: number | null) {
  const queryString = visitId ? buildQueryString({ visit: visitId }) : '';
  const url = visitId
    ? `${OPD_API_CONFIG.VISIT_ATTACHMENTS.LIST}${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<VisitAttachment>
  >(
    url,
    () => (visitId ? getVisitAttachments({ visit: visitId }) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    attachments: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch attachments by type for a specific visit
 * 
 * @example
 * const { attachments, isLoading } = useAttachmentsByType(123, 'xray');
 */
export function useAttachmentsByType(
  visitId: number | null,
  fileType: string
) {
  const queryString =
    visitId && fileType
      ? buildQueryString({ visit: visitId, file_type: fileType })
      : '';
  const url =
    visitId && fileType
      ? `${OPD_API_CONFIG.VISIT_ATTACHMENTS.LIST}${queryString}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<VisitAttachment>
  >(
    url,
    () =>
      visitId && fileType
        ? getVisitAttachments({ visit: visitId, file_type: fileType })
        : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    attachments: data?.results || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new visit attachment (upload file)
 * 
 * @example
 * const { createVisitAttachment, isCreating, error } = useCreateVisitAttachment();
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 * 
 * await createVisitAttachment({
 *   visit: 123,
 *   file: file,
 *   file_type: 'xray',
 *   description: 'Chest X-ray',
 * });
 */
export function useCreateVisitAttachment() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.VISIT_ATTACHMENTS.CREATE,
    async (_key: string, { arg }: { arg: VisitAttachmentCreateData }) =>
      await createVisitAttachment(arg)
  );

  return {
    createVisitAttachment: trigger,
    isCreating: isMutating,
    isUploading: isMutating, // Alias for clarity
    error,
  };
}

/**
 * Hook to update a visit attachment metadata
 * Note: Cannot update the file itself, only file_type and description
 * 
 * @example
 * const { updateVisitAttachment, isUpdating, error } = useUpdateVisitAttachment(123);
 * await updateVisitAttachment({ 
 *   file_type: 'report',
 *   description: 'Updated description' 
 * });
 */
export function useUpdateVisitAttachment(id: number) {
  const url = buildOPDUrl(OPD_API_CONFIG.VISIT_ATTACHMENTS.UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    async (_key: string, { arg }: { arg: VisitAttachmentUpdateData }) =>
      await updateVisitAttachment(id, arg)
  );

  return {
    updateVisitAttachment: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook to delete a visit attachment
 * 
 * @example
 * const { deleteVisitAttachment, isDeleting, error } = useDeleteVisitAttachment();
 * await deleteVisitAttachment(123);
 */
export function useDeleteVisitAttachment() {
  const { trigger, isMutating, error } = useSWRMutation(
    OPD_API_CONFIG.VISIT_ATTACHMENTS.LIST,
    async (_key: string, { arg }: { arg: number }) =>
      await deleteVisitAttachment(arg)
  );

  return {
    deleteVisitAttachment: trigger,
    isDeleting: isMutating,
    error,
  };
}

/**
 * Hook for batch file upload with progress tracking
 * Useful for uploading multiple files at once
 * 
 * @example
 * const { uploadFiles, isUploading, progress } = useBatchUpload(123);
 * await uploadFiles(fileList, 'xray');
 */
export function useBatchUpload(visitId: number) {
  const { trigger, isMutating, error } = useSWRMutation(
    `${OPD_API_CONFIG.VISIT_ATTACHMENTS.CREATE}/batch`,
    async (
      _key: string,
      { arg }: { arg: { files: FileList; file_type: string } }
    ) => {
      const { files, file_type } = arg;
      const uploads: Promise<VisitAttachment>[] = [];

      for (let i = 0; i < files.length; i++) {
        uploads.push(
          createVisitAttachment({
            visit: visitId,
            file: files[i],
            file_type: file_type as any,
            description: files[i].name,
          })
        );
      }

      return await Promise.all(uploads);
    }
  );

  return {
    uploadFiles: trigger,
    isUploading: isMutating,
    error,
  };
}