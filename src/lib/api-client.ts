/**
 * Centralized API client for frontend calls.
 * All fetch logic lives here — components never call fetch directly.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, idempotencyKey, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (idempotencyKey) {
    requestHeaders["Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json();

  if (!json.success) {
    throw new ApiError(
      response.status,
      json.message ?? "An error occurred",
      json.error?.code,
      json.error?.details
    );
  }

  return json as T;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductInventory {
  id: string;
  productId: string;
  warehouseId: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  warehouse: {
    id: string;
    name: string;
    code: string;
    city: string;
    location: string;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  category: string | null;
  isActive: boolean;
  inventories: ProductInventory[];
}

export interface ProductsResponse {
  success: true;
  message: string;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  return request<ProductsResponse>(
    `/api/v1/products${query ? `?${query}` : ""}`
  );
}

// ─── Warehouses ──────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  country: string;
  isActive: boolean;
  totalSkus: number;
}

export interface WarehousesResponse {
  success: true;
  message: string;
  data: Warehouse[];
}

export async function getWarehouses(): Promise<WarehousesResponse> {
  return request<WarehousesResponse>("/api/v1/warehouses");
}

// ─── Reservations ────────────────────────────────────────────────────────────

export type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED";

export interface Reservation {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  confirmedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: string;
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
    city: string;
  };
}

export interface ReservationResponse {
  success: true;
  message: string;
  data: Reservation;
}

export async function createReservation(params: {
  productId: string;
  warehouseId: string;
  quantity: number;
  idempotencyKey?: string;
}): Promise<ReservationResponse> {
  const { idempotencyKey, ...body } = params;
  return request<ReservationResponse>("/api/v1/reservations", {
    method: "POST",
    body,
    idempotencyKey,
  });
}

export async function getReservation(id: string): Promise<ReservationResponse> {
  return request<ReservationResponse>(`/api/v1/reservations/${id}`);
}

export async function confirmReservation(id: string): Promise<ReservationResponse> {
  return request<ReservationResponse>(`/api/v1/reservations/${id}/confirm`, {
    method: "POST",
  });
}

export async function releaseReservation(id: string): Promise<ReservationResponse> {
  return request<ReservationResponse>(`/api/v1/reservations/${id}/release`, {
    method: "POST",
  });
}

export { ApiError };
