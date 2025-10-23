// ==================== API CONFIGURATION ====================
// Complete HMS API endpoints configuration
// Base URL: https://hms.dglinkup.com/api

export const API_CONFIG = {
  BASE_URL: 'https://hms.dglinkup.com/api',

  // ==================== AUTHENTICATION ====================
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
    CHANGE_PASSWORD: '/auth/change-password/',
    USERS_LIST: '/auth/users/',
    USER_DETAIL: '/auth/users/:id/',
    ASSIGN_ROLE: '/auth/users/:id/assign_role/',
    ROLES_LIST: '/auth/users/roles/',
  },

  // ==================== DOCTORS ====================
  DOCTORS: {
    PROFILES_LIST: '/doctors/profiles/',
    PROFILE_DETAIL: '/doctors/profiles/:id/',
    PROFILE_CREATE: '/doctors/profiles/',
    PROFILE_UPDATE: '/doctors/profiles/:id/',
    PROFILE_DELETE: '/doctors/profiles/:id/',
    REGISTER: '/doctors/profiles/register/',
    AVAILABILITY_LIST: '/doctors/profiles/:id/availability/',
    AVAILABILITY_CREATE: '/doctors/profiles/:id/set_availability/',
    STATISTICS: '/doctors/profiles/statistics/',
    SPECIALTIES_LIST: '/doctors/specialties/',
    SPECIALTY_DETAIL: '/doctors/specialties/:id/',
    SPECIALTY_CREATE: '/doctors/specialties/',
    SPECIALTY_UPDATE: '/doctors/specialties/:id/',
    SPECIALTY_DELETE: '/doctors/specialties/:id/',
  },

  // ==================== PATIENTS ====================
  PATIENTS: {
    LIST: '/patients/profiles/',
    DETAIL: '/patients/profiles/:id/',
    CREATE: '/patients/profiles/',
    UPDATE: '/patients/profiles/:id/',
    DELETE: '/patients/profiles/:id/',
    VITALS_LIST: '/patients/profiles/:id/vitals/',
    RECORD_VITALS: '/patients/profiles/:id/record_vitals/',
    MEDICAL_HISTORY_LIST: '/patients/profiles/:id/medical_history/',
    ADD_MEDICAL_HISTORY: '/patients/profiles/:id/add_medical_history/',
    ALLERGIES_LIST: '/patients/profiles/:id/allergies/',
    ADD_ALLERGY: '/patients/profiles/:id/add_allergy/',
    MEDICATIONS_LIST: '/patients/profiles/:id/medications/',
    ADD_MEDICATION: '/patients/profiles/:id/add_medication/',
    STATISTICS: '/patients/profiles/statistics/',
  },

  // ==================== APPOINTMENTS ====================
  APPOINTMENTS: {
    LIST: '/appointments/appointments/',
    DETAIL: '/appointments/appointments/:id/',
    CREATE: '/appointments/appointments/',
    UPDATE: '/appointments/appointments/:id/',
    DELETE: '/appointments/appointments/:id/',
    CONFIRM: '/appointments/appointments/:id/confirm/',
    CANCEL: '/appointments/appointments/:id/cancel/',
    RESCHEDULE: '/appointments/appointments/:id/reschedule/',
    AVAILABLE_SLOTS: '/appointments/appointments/available_slots/',
    STATISTICS: '/appointments/appointments/statistics/',
  },

  // ==================== OPD VISITS ====================
  OPD: {
    VISITS_LIST: '/opd/visits/',
    VISIT_DETAIL: '/opd/visits/:id/',
    VISIT_CREATE: '/opd/visits/',
    VISIT_UPDATE: '/opd/visits/:id/',
    VISIT_DELETE: '/opd/visits/:id/',
    QUEUE: '/opd/visits/queue/',
    CALL_NEXT: '/opd/visits/call_next/',
    COMPLETE_VISIT: '/opd/visits/:id/complete/',
    VISIT_STATISTICS: '/opd/visits/statistics/',
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

  // ==================== PROCEDURE MANAGEMENT ====================
  PROCEDURES: {
    MASTERS_LIST: '/opd/procedure-masters/',
    MASTER_DETAIL: '/opd/procedure-masters/:id/',
    MASTER_CREATE: '/opd/procedure-masters/',
    MASTER_UPDATE: '/opd/procedure-masters/:id/',
    MASTER_DELETE: '/opd/procedure-masters/:id/',
    BILLS_LIST: '/opd/procedure-bills/',
    BILL_DETAIL: '/opd/procedure-bills/:id/',
    BILL_CREATE: '/opd/procedure-bills/',
    BILL_UPDATE: '/opd/procedure-bills/:id/',
    BILL_DELETE: '/opd/procedure-bills/:id/',
    RECORD_PAYMENT: '/opd/procedure-bills/:id/record_payment/',
    PRINT_BILL: '/opd/procedure-bills/:id/print/',
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

  // ==================== ORDERS ====================
  ORDERS: {
    LIST: '/opd/orders/',
    DETAIL: '/opd/orders/:id/',
    CREATE: '/opd/orders/',
    UPDATE: '/opd/orders/:id/',
    DELETE: '/opd/orders/:id/',
    MARK_COMPLETED: '/opd/orders/:id/mark_completed/',
    STATISTICS: '/opd/orders/statistics/',
  },

  // ==================== PHARMACY ====================
  PHARMACY: {
    MEDICINES_LIST: '/pharmacy/medicines/',
    MEDICINE_DETAIL: '/pharmacy/medicines/:id/',
    MEDICINE_CREATE: '/pharmacy/medicines/',
    MEDICINE_UPDATE: '/pharmacy/medicines/:id/',
    MEDICINE_DELETE: '/pharmacy/medicines/:id/',
    MEDICINE_CATEGORIES_LIST: '/pharmacy/medicine-categories/',
    MEDICINE_CATEGORY_DETAIL: '/pharmacy/medicine-categories/:id/',
    STOCK_LIST: '/pharmacy/medicine-stock/',
    STOCK_DETAIL: '/pharmacy/medicine-stock/:id/',
    ADJUST_STOCK: '/pharmacy/medicine-stock/:id/adjust_stock/',
    LOW_STOCK: '/pharmacy/medicine-stock/low_stock/',
    SALES_LIST: '/pharmacy/medicine-sales/',
    SALE_DETAIL: '/pharmacy/medicine-sales/:id/',
    SALE_CREATE: '/pharmacy/medicine-sales/',
    SALE_UPDATE: '/pharmacy/medicine-sales/:id/',
    SALE_DELETE: '/pharmacy/medicine-sales/:id/',
    RECORD_PAYMENT: '/pharmacy/medicine-sales/:id/record_payment/',
    PRINT_BILL: '/pharmacy/medicine-sales/:id/print/',
  },

  // ==================== PAYMENTS ====================
  PAYMENTS: {
    TRANSACTIONS_LIST: '/payments/transactions/',
    TRANSACTION_DETAIL: '/payments/transactions/:id/',
    TRANSACTION_CREATE: '/payments/transactions/',
    TRANSACTION_UPDATE: '/payments/transactions/:id/',
    TRANSACTION_DELETE: '/payments/transactions/:id/',
    RECONCILE: '/payments/transactions/:id/reconcile/',
    STATISTICS: '/payments/transactions/statistics/',
    CATEGORIES_LIST: '/payments/categories/',
    CATEGORY_DETAIL: '/payments/categories/:id/',
    CATEGORY_CREATE: '/payments/categories/',
    CATEGORY_UPDATE: '/payments/categories/:id/',
    CATEGORY_DELETE: '/payments/categories/:id/',
    ACCOUNTING_PERIODS_LIST: '/payments/accounting-periods/',
    ACCOUNTING_PERIOD_DETAIL: '/payments/accounting-periods/:id/',
    ACCOUNTING_PERIOD_CREATE: '/payments/accounting-periods/',
    ACCOUNTING_PERIOD_UPDATE: '/payments/accounting-periods/:id/',
    CLOSE_PERIOD: '/payments/accounting-periods/:id/close/',
    RECALCULATE_PERIOD: '/payments/accounting-periods/:id/recalculate/',
  },

  // ==================== SERVICES ====================
  SERVICES: {
    CATEGORIES_LIST: '/services/categories/',
    CATEGORY_DETAIL: '/services/categories/:id/',
    CATEGORY_CREATE: '/services/categories/',
    CATEGORY_UPDATE: '/services/categories/:id/',
    CATEGORY_DELETE: '/services/categories/:id/',
    DIAGNOSTIC_TESTS_LIST: '/services/diagnostic-tests/',
    DIAGNOSTIC_TEST_DETAIL: '/services/diagnostic-tests/:id/',
    DIAGNOSTIC_TEST_CREATE: '/services/diagnostic-tests/',
    DIAGNOSTIC_TEST_UPDATE: '/services/diagnostic-tests/:id/',
    DIAGNOSTIC_TEST_DELETE: '/services/diagnostic-tests/:id/',
    HOME_HEALTHCARE_LIST: '/services/home-healthcare/',
    HOME_HEALTHCARE_DETAIL: '/services/home-healthcare/:id/',
    HOME_HEALTHCARE_CREATE: '/services/home-healthcare/',
    HOME_HEALTHCARE_UPDATE: '/services/home-healthcare/:id/',
    HOME_HEALTHCARE_DELETE: '/services/home-healthcare/:id/',
    NURSING_PACKAGES_LIST: '/services/nursing-packages/',
    NURSING_PACKAGE_DETAIL: '/services/nursing-packages/:id/',
    NURSING_PACKAGE_CREATE: '/services/nursing-packages/',
    NURSING_PACKAGE_UPDATE: '/services/nursing-packages/:id/',
    NURSING_PACKAGE_DELETE: '/services/nursing-packages/:id/',
  },

  // ==================== HOSPITAL CONFIG ====================
  HOSPITAL: {
    CONFIG: '/hospital/config/',
    CONFIG_UPDATE: '/hospital/config/',
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build full URL with base URL
 * @param endpoint - API endpoint path
 * @param params - URL parameters to replace (e.g., {id: '1'})
 * @returns Full URL string
 */
export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Replace URL parameters (e.g., :id)
  if (params) {
    Object.keys(params).forEach((key) => {
      url = url.replace(`:${key}`, String(params[key]));
    });
  }

  return url;
};

/**
 * Build query string from params object
 * @param params - Query parameters object
 * @returns Query string (e.g., '?key1=value1&key2=value2')
 */
export const buildQueryString = (
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params) return '';

  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryParams ? `?${queryParams}` : '';
};

/**
 * Get full URL with query parameters
 * @param endpoint - API endpoint path
 * @param urlParams - URL parameters to replace (e.g., {id: '1'})
 * @param queryParams - Query parameters object
 * @returns Full URL with query string
 */
export const getFullUrl = (
  endpoint: string,
  urlParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean | undefined>
): string => {
  const baseUrl = buildUrl(endpoint, urlParams);
  const queryString = buildQueryString(queryParams);
  return `${baseUrl}${queryString}`;
};