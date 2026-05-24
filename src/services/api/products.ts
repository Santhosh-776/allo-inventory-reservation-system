import { ProductWithInventory, PaginationMeta } from "../../types";

export interface ListProductsResponse {
    success: boolean;
    data: ProductWithInventory[];
    meta: PaginationMeta;
    message: string;
}

export interface ProductResponse {
    success: boolean;
    data: ProductWithInventory;
    message: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function listProducts(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
    });

    const res = await fetch(`${API_BASE}/api/v1/products?${params}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<ListProductsResponse>;
}

export async function getProductById(id: string) {
    const res = await fetch(`${API_BASE}/api/v1/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json() as Promise<ProductResponse>;
}
