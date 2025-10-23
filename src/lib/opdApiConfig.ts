// src/lib/opdApiConfig.ts

export const OPD_API_CONFIG = {
  BASE_URL: 'https://hms.dglinkup.com/api',
  
  // ==================== OPD VISITS ====================
  VISITS: {
    LIST: '/opd/visits/',
    DETAIL: '/opd/visits/:id/',
    CREATE: '/opd/visits/',
    UPDATE: '/opd/visits/:id/',
    DELETE: '/opd/visits/:id/',
    TODAY: '/opd/visits/today/',
    QUEUE: '/opd/visits/queue/',
    CALL_NEXT: '/opd/visits/call_next/',
    COMPLETE: '/opd/visits/:id/complete/',
    STATISTICS: '/opd/visits/statistics/',
  },
  
  // ==================== OPD BILLS ====================
  OPD_BILLS: {
    LIST: '/opd/opd-bills/',
    DETAIL: '/opd/opd-bills/:id/',
    CREATE: '/opd/opd-bills/',
    UPDATE: '/opd/opd-bills/:id/',
    DELETE: '/opd/opd-bills/:id/',
    RECORD_PAYMENT: '/opd/opd-bills/:id/record_payment/',
    PRINT: '/opd/opd-bills/:id/print/',
  },
  
  // ==================== PROCEDURE MASTERS ====================
  PROCEDURE_MASTERS: {
    LIST: '/opd/procedure-masters/',
    DETAIL: '/opd/procedure-masters/:id/',
    CREATE: '/opd/procedure-masters/',
    UPDATE: '/opd/procedure-masters/:id/',
    DELETE: '/opd/procedure-masters/:id/',
  },
  
  // ==================== PROCEDURE PACKAGES ====================
  PROCEDURE_PACKAGES: {
    LIST: '/opd/procedure-packages/',
    DETAIL: '/opd/procedure-packages/:id/',
    CREATE: '/opd/procedure-packages/',
    UPDATE: '/opd/procedure-packages/:id/',
    DELETE: '/opd/procedure-packages/:id/',
  },
  
  // ==================== PROCEDURE BILLS ====================
  PROCEDURE_BILLS: {
    LIST: '/opd/procedure-bills/',
    DETAIL: '/opd/procedure-bills/:id/',
    CREATE: '/opd/procedure-bills/',
    UPDATE: '/opd/procedure-bills/:id/',
    DELETE: '/opd/procedure-bills/:id/',
    RECORD_PAYMENT: '/opd/procedure-bills/:id/record_payment/',
    PRINT: '/opd/procedure-bills/:id/print/',
    ITEMS_LIST: '/opd/procedure-bill-items/',
    ITEM_DETAIL: '/opd/procedure-bill-items/:id/',
  },
  
  // ==================== CLINICAL NOTES ====================
  CLINICAL_NOTES: {
    LIST: '/opd/clinical-notes/',
    DETAIL: '/opd/clinical-notes/:id/',
    CREATE: '/opd/clinical-notes/',
    UPDATE: '/opd/clinical-notes/:id/',
    DELETE: '/opd/clinical-notes/:id/',
  },
  
  // ==================== VISIT FINDINGS ====================
  VISIT_FINDINGS: {
    LIST: '/opd/visit-findings/',
    DETAIL: '/opd/visit-findings/:id/',
    CREATE: '/opd/visit-findings/',
    UPDATE: '/opd/visit-findings/:id/',
    DELETE: '/opd/visit-findings/:id/',
  },
  
  // ==================== VISIT ATTACHMENTS ====================
  VISIT_ATTACHMENTS: {
    LIST: '/opd/visit-attachments/',
    DETAIL: '/opd/visit-attachments/:id/',
    CREATE: '/opd/visit-attachments/',
    UPDATE: '/opd/visit-attachments/:id/',
    DELETE: '/opd/visit-attachments/:id/',
  },
};

// Helper function to build URLs with parameters
export const buildOPDUrl = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  let url = `${OPD_API_CONFIG.BASE_URL}${endpoint}`;
  if (params) {
    Object.keys(params).forEach((key) => {
      url = url.replace(`:${key}`, String(params[key]));
    });
  }
  return url;
};