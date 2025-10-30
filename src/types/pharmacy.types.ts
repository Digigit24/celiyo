// src/types/pharmacy.types.ts
// ==================== PHARMACY TYPES ====================
// 100% consistent with Django backend models

// ==================== PRODUCT CATEGORY TYPES ====================
export type CategoryType = 'medicine' | 'healthcare_product' | 'medical_equipment';

export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  type: CategoryType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryCreateData {
  name: string;
  description?: string | null;
  type: CategoryType;
  is_active?: boolean;
}

export interface ProductCategoryUpdateData {
  name?: string;
  description?: string | null;
  type?: CategoryType;
  is_active?: boolean;
}

// ==================== PHARMACY PRODUCT TYPES ====================
export interface PharmacyProduct {
  id: number;
  product_name: string;
  category: ProductCategory;
  packing: string | null;
  company: string;
  batch_no: string;
  quantity: number;
  minimum_stock_level: number;
  expiry_date: string; // Date as ISO string
  mrp: string; // Decimal as string
  selling_price: string; // Decimal as string
  description: string | null;
  prescription_required: boolean;
  image: string | null;
  is_active: boolean;
  is_in_stock: boolean; // Computed field
  low_stock_warning: boolean; // Computed field
  created_at: string;
  updated_at: string;
}

export interface PharmacyProductCreateData {
  product_name: string;
  category: number; // Category ID
  packing?: string | null;
  company: string;
  batch_no: string;
  quantity?: number;
  minimum_stock_level?: number;
  expiry_date: string; // ISO date string
  mrp: number | string;
  selling_price: number | string;
  description?: string | null;
  prescription_required?: boolean;
  image?: File | string | null;
  is_active?: boolean;
}

export interface PharmacyProductUpdateData {
  product_name?: string;
  category?: number;
  packing?: string | null;
  company?: string;
  batch_no?: string;
  quantity?: number;
  minimum_stock_level?: number;
  expiry_date?: string;
  mrp?: number | string;
  selling_price?: number | string;
  description?: string | null;
  prescription_required?: boolean;
  image?: File | string | null;
  is_active?: boolean;
}

export interface PharmacyProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string | number; // Can filter by name or ID
  company?: string;
  is_active?: boolean;
  in_stock?: boolean;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// ==================== CART TYPES ====================
export interface Cart {
  id: number;
  user: number;
  cart_items: CartItem[];
  total_items: number; // Computed property
  total_amount: string; // Decimal as string, computed property
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart: number;
  product: PharmacyProduct;
  product_id?: number; // For write operations
  quantity: number;
  price_at_time: string; // Decimal as string
  total_price: string; // Computed field
}

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

// ==================== ORDER TYPES ====================
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PharmacyOrder {
  id: number;
  user: number | null;
  total_amount: string; // Decimal as string
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: string;
  billing_address: string;
  order_items: PharmacyOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PharmacyOrderItem {
  id: number;
  order: number;
  product: PharmacyProduct;
  quantity: number;
  price_at_time: string; // Decimal as string
  total_price: string; // Computed property
}

export interface PharmacyOrderCreateData {
  shipping_address: string;
  billing_address: string;
}

export interface PharmacyOrderUpdateData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_address?: string;
  billing_address?: string;
}

export interface PharmacyOrderListParams {
  page?: number;
  page_size?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  ordering?: string;
  
  [key: string]: string | number | boolean | undefined;
}

// ==================== STATISTICS TYPES ====================
export interface PharmacyStatistics {
  total_products: number;
  in_stock_products: number;
  low_stock_products: number;
  near_expiry_products: number;
}

export interface LowStockProduct extends PharmacyProduct {}
export interface NearExpiryProduct extends PharmacyProduct {}

// ==================== API RESPONSE WRAPPERS ====================
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}