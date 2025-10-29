// src/types/opd/procedurePackage.types.ts

/**
 * Procedure Package Model Type Definitions
 * Matches: opd/models.py - ProcedurePackage Model
 * API Endpoint: /api/opd/procedure-packages/
 */

/**
 * Full Procedure Package object returned from API
 */
export interface ProcedurePackage {
  // Primary Fields
  id: number;
  name: string; // CharField(200)
  code: string; // CharField(50), unique
  
  // Procedures (ManyToMany relationship)
  procedures: ProcedureMasterInfo[]; // From serializer
  
  // Pricing
  total_charge: string; // DecimalField(10, 2) - Sum of individual procedure charges
  discounted_charge: string; // DecimalField(10, 2) - Package discounted price
  
  // Computed Fields (from model @property)
  discount_percent: string; // Calculated: (total - discounted) / total * 100
  savings_amount: string; // Calculated: total - discounted
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string; // DateTimeField - auto_now_add, ISO format
  updated_at: string; // DateTimeField - auto_now, ISO format
}

/**
 * Procedure info within a package (from ProcedureMasterListSerializer)
 */
export interface ProcedureMasterInfo {
  id: number;
  name: string;
  code: string;
  category: string;
  default_charge: string;
  is_active: boolean;
}

/**
 * Query parameters for listing/filtering procedure packages
 */
export interface ProcedurePackageListParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string; // Default: ['name']
  [key: string]: string | number | boolean | undefined;
}

/**
 * Data required to create a new procedure package
 */
export interface ProcedurePackageCreateData {
  name: string;
  code: string;
  procedures: number[]; // Array of procedure IDs
  total_charge: string;
  discounted_charge: string;
  is_active?: boolean;
}

/**
 * Data for updating an existing procedure package
 */
export interface ProcedurePackageUpdateData extends Partial<ProcedurePackageCreateData> {}