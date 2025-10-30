// src/hooks/usePharmacy.ts
// UPDATED to match actual backend API endpoints
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { API_CONFIG, buildUrl, buildQueryString } from '@/lib/apiConfig';
import { fetcher, postFetcher, putFetcher, patchFetcher, deleteFetcher } from '@/lib/swrConfig';
import type {
  ProductCategory,
  ProductCategoryCreateData,
  ProductCategoryUpdateData,
  PharmacyProduct,
  PharmacyProductCreateData,
  PharmacyProductUpdateData,
  PharmacyProductListParams,
  Cart,
  AddToCartData,
  UpdateCartItemData,
  PharmacyOrder,
  PharmacyOrderCreateData,
  PharmacyOrderUpdateData,
  PharmacyOrderListParams,
  PharmacyStatistics,
  LowStockProduct,
  NearExpiryProduct,
  PaginatedResponse,
  ApiResponse,
} from '@/types/pharmacy.types';

// ==================== PRODUCT CATEGORIES HOOKS ====================

// Hook to fetch all product categories
export const useProductCategories = () => {
  const url = API_CONFIG.PHARMACY.CATEGORIES_LIST;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<ProductCategory>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    categories: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single product category
export const useProductCategory = (id: number | string | null) => {
  const url = id
    ? buildUrl(API_CONFIG.PHARMACY.CATEGORY_DETAIL, { id })
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProductCategory>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    category: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create product category
export const useCreateProductCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.CATEGORY_CREATE,
    postFetcher<ProductCategory>
  );

  return {
    createCategory: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update product category
export const useUpdateProductCategory = (id: number | string) => {
  const url = buildUrl(API_CONFIG.PHARMACY.CATEGORY_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    patchFetcher<ProductCategory>
  );

  return {
    updateCategory: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete product category
export const useDeleteProductCategory = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.CATEGORY_DETAIL,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteCategory: trigger,
    isDeleting: isMutating,
    error,
  };
};

// ==================== PHARMACY PRODUCTS HOOKS ====================

// Hook to fetch pharmacy products with filters
export const usePharmacyProducts = (params?: PharmacyProductListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.PHARMACY.PRODUCTS_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PharmacyProduct>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    products: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single pharmacy product
export const usePharmacyProduct = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.PHARMACY.PRODUCT_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<PharmacyProduct>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    product: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create pharmacy product
export const useCreatePharmacyProduct = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.PRODUCT_CREATE,
    postFetcher<PharmacyProduct>
  );

  return {
    createProduct: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update pharmacy product
export const useUpdatePharmacyProduct = (id: number | string) => {
  const url = buildUrl(API_CONFIG.PHARMACY.PRODUCT_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    patchFetcher<PharmacyProduct>
  );

  return {
    updateProduct: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete pharmacy product
export const useDeletePharmacyProduct = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.PRODUCT_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteProduct: trigger,
    isDeleting: isMutating,
    error,
  };
};

// Hook to fetch low stock products
export const useLowStockProducts = () => {
  const url = API_CONFIG.PHARMACY.LOW_STOCK;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<LowStockProduct[]>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    lowStockProducts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch near expiry products
export const useNearExpiryProducts = () => {
  const url = API_CONFIG.PHARMACY.NEAR_EXPIRY;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<NearExpiryProduct[]>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    nearExpiryProducts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch pharmacy statistics
export const usePharmacyStatistics = () => {
  const url = API_CONFIG.PHARMACY.STATISTICS;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PharmacyStatistics>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    statistics: data?.data || null,
    isLoading,
    error,
    mutate,
  };
};

// ==================== CART HOOKS ====================

// Hook to fetch user's cart
export const useCart = () => {
  const url = API_CONFIG.PHARMACY.CART_LIST;

  const { data, error, isLoading, mutate } = useSWR<Cart>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    cart: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to add item to cart
export const useAddToCart = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.ADD_TO_CART,
    postFetcher<ApiResponse<Cart>>
  );

  return {
    addToCart: trigger,
    isAdding: isMutating,
    error,
  };
};

// Hook to update cart item
export const useUpdateCartItem = (itemId: number | string) => {
  const url = buildUrl(API_CONFIG.PHARMACY.CART_UPDATE, { id: itemId });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    patchFetcher<ApiResponse<Cart>>
  );

  return {
    updateCartItem: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to remove cart item
export const useRemoveCartItem = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.CART_DELETE,
    async (url: string, { arg }: { arg: { itemId: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.itemId });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    removeCartItem: trigger,
    isRemoving: isMutating,
    error,
  };
};

// ==================== ORDERS HOOKS ====================

// Hook to fetch orders with filters
export const usePharmacyOrders = (params?: PharmacyOrderListParams) => {
  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.PHARMACY.ORDERS_LIST}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PharmacyOrder>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    orders: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    mutate,
  };
};

// Hook to fetch single order
export const usePharmacyOrder = (id: number | string | null) => {
  const url = id ? buildUrl(API_CONFIG.PHARMACY.ORDER_DETAIL, { id }) : null;

  const { data, error, isLoading, mutate } = useSWR<PharmacyOrder>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    order: data || null,
    isLoading,
    error,
    mutate,
  };
};

// Hook to create order
export const useCreatePharmacyOrder = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.ORDER_CREATE,
    postFetcher<ApiResponse<PharmacyOrder>>
  );

  return {
    createOrder: trigger,
    isCreating: isMutating,
    error,
  };
};

// Hook to update order
export const useUpdatePharmacyOrder = (id: number | string) => {
  const url = buildUrl(API_CONFIG.PHARMACY.ORDER_UPDATE, { id });

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    patchFetcher<PharmacyOrder>
  );

  return {
    updateOrder: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Hook to delete order
export const useDeletePharmacyOrder = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    API_CONFIG.PHARMACY.ORDER_DELETE,
    async (url: string, { arg }: { arg: { id: number | string } }) => {
      const deleteUrl = buildUrl(url, { id: arg.id });
      return deleteFetcher(deleteUrl);
    }
  );

  return {
    deleteOrder: trigger,
    isDeleting: isMutating,
    error,
  };
};