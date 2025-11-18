// ==================== API CONFIGURATION ====================
// Celiyo Multi-Tenant API Configuration
// Auth API: http://admin.celiyo.com/api (port 8000)
// CRM API: http://cr.celiyo.com/api (port 8001)
// WhatsApp API: http://whatsapp.dglinkup.com/api (port 8002)

export const API_CONFIG = {
  // ==================== BASE URLS ====================
  // You can override these via Vite env vars in .env/.env.local
  // VITE_AUTH_BASE_URL, VITE_CRM_BASE_URL, VITE_WHATSAPP_BASE_URL, VITE_WHATSAPP_WS_URL
  AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL || 'https://admin.celiyo.com/api',
  CRM_BASE_URL: import.meta.env.VITE_CRM_BASE_URL || 'https://crm.celiyo.com/api',
  HMS_BASE_URL: import.meta.env.VITE_HMS_BASE_URL || 'https://hms.celiyo.com/api',
  WHATSAPP_BASE_URL: import.meta.env.VITE_WHATSAPP_BASE_URL || 'https://whatsapp.dglinkup.com/api',
  
  // ✅ WebSocket URL for real-time WhatsApp updates
  WHATSAPP_WS_URL: import.meta.env.VITE_WHATSAPP_WS_URL || 'wss://whatsapp.dglinkup.com',
  
  // For development, set in .env.local instead of editing code:
  // VITE_AUTH_BASE_URL=http://localhost:8000/api
  // VITE_CRM_BASE_URL=http://localhost:8001/api
  // VITE_WHATSAPP_BASE_URL=http://localhost:8002/api
  // VITE_WHATSAPP_WS_URL=ws://localhost:8002

  // ==================== AUTHENTICATION ====================
  AUTH: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/token/refresh/',
    VERIFY: '/auth/token/verify/',
    LOGOUT: '/auth/logout/',
  },

  // ==================== HMS ====================
  HMS: {
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
      LIST: '/patients/',
      DETAIL: '/patients/:id/',
      CREATE: '/patients/',
      UPDATE: '/patients/:id/',
      DELETE: '/patients/:id/',
      VITALS_LIST: '/patients/:id/vitals/',
      RECORD_VITALS: '/patients/:id/record_vitals/',
      MEDICAL_HISTORY_LIST: '/patients/:id/medical_history/',
      ADD_MEDICAL_HISTORY: '/patients/:id/add_medical_history/',
      ALLERGIES_LIST: '/patients/:id/allergies/',
      ADD_ALLERGY: '/patients/:id/add_allergy/',
      MEDICATIONS_LIST: '/patients/:id/medications/',
      ADD_MEDICATION: '/patients/:id/add_medication/',
      STATISTICS: '/patients/statistics/',
    },

    // ==================== APPOINTMENTS ====================
    APPOINTMENTS: {
      LIST: '/appointments/',
      DETAIL: '/appointments/:id/',
      CREATE: '/appointments/',
      UPDATE: '/appointments/:id/',
      DELETE: '/appointments/:id/',
      CHECK_IN: '/appointments/:id/check_in/',
      START: '/appointments/:id/start/',
      COMPLETE: '/appointments/:id/complete/',
      TODAY: '/appointments/today/',
      UPCOMING: '/appointments/upcoming/',
    },

    // Appointment Types endpoints
    APPOINTMENT_TYPES: {
      LIST: '/appointments/types/',
      DETAIL: '/appointments/types/:id/',
      CREATE: '/appointments/types/',
      UPDATE: '/appointments/types/:id/',
      DELETE: '/appointments/types/:id/',
    },

    // ==================== OPD VISITS ====================
    OPD: {
      VISITS_LIST: '/opd/visits/',
      VISIT_DETAIL: '/opd/visits/:id/',
      VISIT_CREATE: '/opd/visits/',
      VISIT_UPDATE: '/opd/visits/:id/',
      VISIT_DELETE: '/opd/visits/:id/',
      VISITS_TODAY: '/opd/visits/today/',
      VISITS_QUEUE: '/opd/visits/queue/',
      VISITS_CALL_NEXT: '/opd/visits/call_next/',
      VISIT_COMPLETE: '/opd/visits/:id/complete/',
      VISITS_STATISTICS: '/opd/visits/statistics/',
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
      // Product Categories
      CATEGORIES_LIST: '/pharmacy/categories/',
      CATEGORY_DETAIL: '/pharmacy/categories/:id/',
      CATEGORY_CREATE: '/pharmacy/categories/',
      CATEGORY_UPDATE: '/pharmacy/categories/:id/',
      CATEGORY_DELETE: '/pharmacy/categories/:id/',
      
      // Products
      PRODUCTS_LIST: '/pharmacy/products/',
      PRODUCT_DETAIL: '/pharmacy/products/:id/',
      PRODUCT_CREATE: '/pharmacy/products/',
      PRODUCT_UPDATE: '/pharmacy/products/:id/',
      PRODUCT_DELETE: '/pharmacy/products/:id/',
      
      // Product Stats & Filters
      LOW_STOCK: '/pharmacy/products/low_stock/',
      NEAR_EXPIRY: '/pharmacy/products/near_expiry/',
      STATISTICS: '/pharmacy/products/statistics/',
      
      // Cart
      CART_LIST: '/pharmacy/cart/',
      CART_CREATE: '/pharmacy/cart/',
      CART_DETAIL: '/pharmacy/cart/:id/',
      CART_UPDATE: '/pharmacy/cart/:id/',
      CART_DELETE: '/pharmacy/cart/:id/',
      ADD_TO_CART: '/pharmacy/cart/add_item/',
      
      // Orders
      ORDERS_LIST: '/pharmacy/orders/',
      ORDER_DETAIL: '/pharmacy/orders/:id/',
      ORDER_CREATE: '/pharmacy/orders/',
      ORDER_UPDATE: '/pharmacy/orders/:id/',
      ORDER_DELETE: '/pharmacy/orders/:id/',
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

    TENANTS: {
      LIST: '/tenants/tenants/',
      DETAIL: '/tenants/tenants/:id/',
      CREATE: '/tenants/tenants/',
      UPDATE: '/tenants/tenants/:id/',
      DELETE: '/tenants/tenants/:id/',
      ACTIVATE: '/tenants/tenants/:id/activate/',
      DEACTIVATE: '/tenants/tenants/:id/deactivate/',
      TEST_CONNECTION: '/tenants/tenants/:id/test_connection/',
      RUN_MIGRATIONS: '/tenants/tenants/:id/run_migrations/',
      STATS: '/tenants/tenants/:id/stats/',
      DASHBOARD: '/tenants/dashboard/',
      ONBOARD: '/tenants/onboard/',
      CHECK_SUBDOMAIN: '/tenants/check-subdomain/',
      SETTINGS_LIST: '/tenants/settings/',
      SETTINGS_DETAIL: '/tenants/settings/:id/',
      SETTINGS_UPDATE: '/tenants/settings/:id/',
    },

    NEON: {
      PROJECTS: '/tenants/neon/projects/',
      BRANCHES: '/tenants/neon/projects/:project_id/branches/',
    },

    // ==================== HOSPITAL CONFIG ====================
    HOSPITAL: {
      CONFIG: '/hospital/config/',
      CONFIG_UPDATE: '/hospital/config/',
    },
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build full URL with appropriate base URL
 * @param endpoint - API endpoint path
 * @param params - URL parameters to replace (e.g., {id: '1'})
 * @param apiType - 'auth' | 'crm' | 'hms' | 'whatsapp' to determine base URL
 * @returns Full URL string
 */
export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number>,
  apiType: 'auth' | 'crm' | 'hms' | 'whatsapp' = 'auth'
): string => {
  const baseUrl =
    apiType === 'auth' ? API_CONFIG.AUTH_BASE_URL :
    apiType === 'crm' ? API_CONFIG.CRM_BASE_URL :
    apiType === 'hms' ? API_CONFIG.HMS_BASE_URL :
    API_CONFIG.WHATSAPP_BASE_URL;
  
  let url = `${baseUrl}${endpoint}`;

  // Replace URL parameters (e.g., :id, :phone, :name) with URL-encoded values
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      const encoded = encodeURIComponent(String(value));
      url = url.replace(`:${key}`, encoded);
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
 * @param apiType - 'auth' | 'crm' | 'hms' | 'whatsapp' to determine base URL
 * @returns Full URL with query string
 */
export const getFullUrl = (
  endpoint: string,
  urlParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean | undefined>,
  apiType: 'auth' | 'crm' | 'hms' | 'whatsapp' = 'auth'
): string => {
  const baseUrl = buildUrl(endpoint, urlParams, apiType);
  const queryString = buildQueryString(queryParams);
  return `${baseUrl}${queryString}`;
};

// ==================== BACKWARD COMPATIBILITY ====================
// Legacy exports for existing code
export const OPD_API_CONFIG = {
  BASE_URL: API_CONFIG.HMS_BASE_URL,
  
  VISITS: {
    LIST: API_CONFIG.HMS.OPD.VISITS_LIST,
    DETAIL: API_CONFIG.HMS.OPD.VISIT_DETAIL,
    CREATE: API_CONFIG.HMS.OPD.VISIT_CREATE,
    UPDATE: API_CONFIG.HMS.OPD.VISIT_UPDATE,
    DELETE: API_CONFIG.HMS.OPD.VISIT_DELETE,
    TODAY: API_CONFIG.HMS.OPD.VISITS_TODAY,
    QUEUE: API_CONFIG.HMS.OPD.VISITS_QUEUE,
    CALL_NEXT: API_CONFIG.HMS.OPD.VISITS_CALL_NEXT,
    COMPLETE: API_CONFIG.HMS.OPD.VISIT_COMPLETE,
    STATISTICS: API_CONFIG.HMS.OPD.VISITS_STATISTICS,
  },
  
  OPD_BILLS: API_CONFIG.HMS.OPD_BILLS,
  PROCEDURE_MASTERS: API_CONFIG.HMS.PROCEDURE_MASTERS,
  PROCEDURE_PACKAGES: API_CONFIG.HMS.PROCEDURE_PACKAGES,
  PROCEDURE_BILLS: API_CONFIG.HMS.PROCEDURE_BILLS,
  CLINICAL_NOTES: API_CONFIG.HMS.CLINICAL_NOTES,
  VISIT_FINDINGS: API_CONFIG.HMS.VISIT_FINDINGS,
  VISIT_ATTACHMENTS: API_CONFIG.HMS.VISIT_ATTACHMENTS,
};

// Legacy buildUrl function for backward compatibility
export const buildOPDUrl = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  return buildUrl(endpoint, params, 'hms');
};