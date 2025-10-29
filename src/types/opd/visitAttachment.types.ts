// src/types/opd/visitAttachment.types.ts

/**
 * Visit Attachment Model Type Definitions
 * Matches: opd/models.py - VisitAttachment Model
 * API Endpoint: /api/opd/visit-attachments/
 */

export type FileType = 
  | 'xray' 
  | 'report' 
  | 'prescription' 
  | 'scan' 
  | 'document' 
  | 'other';

/**
 * Full Visit Attachment object returned from API
 */
export interface VisitAttachment {
  // Primary Fields
  id: number;
  visit: number; // ForeignKey
  file: string; // FileField URL path
  file_name: string; // CharField(255) - stored filename
  file_type: FileType;
  description: string; // TextField
  
  // Related Model Names (read-only, from serializer)
  visit_number?: string;
  uploaded_by_name?: string;
  
  // Computed Fields (from serializer methods)
  file_size?: string; // Human-readable format, e.g., "2.5 MB"
  file_extension?: string; // e.g., ".pdf", ".jpg"
  
  // Audit Fields
  uploaded_by: number | null;
  uploaded_at: string; // DateTimeField - auto_now_add, ISO format
}

/**
 * Query parameters for listing/filtering visit attachments
 */
export interface VisitAttachmentListParams {
  page?: number;
  page_size?: number;
  visit?: number;
  file_type?: string;
  search?: string;
  ordering?: string; // Default: ['-uploaded_at']
  [key: string]: string | number | boolean | undefined;
}

/**
 * Data required to create a new visit attachment
 * Note: Uses FormData for file upload
 */
export interface VisitAttachmentCreateData {
  visit: number;
  file: File;
  file_type: FileType;
  description?: string;
}

/**
 * Data for updating an existing visit attachment
 * Note: Cannot update the file itself, only metadata
 */
export interface VisitAttachmentUpdateData {
  file_type?: FileType;
  description?: string;
}