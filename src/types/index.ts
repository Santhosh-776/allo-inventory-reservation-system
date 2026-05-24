import type { ReservationStatus } from "../app/generated/prisma/enums";

export type { ReservationStatus };

export interface ProductWithInventory {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: string; // Decimal serialized as string
    category: string | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    inventories: InventoryWithWarehouse[];
}

export interface InventoryWithWarehouse {
    id: string;
    productId: string;
    warehouseId: string;
    totalStock: number;
    reservedStock: number;
    availableStock: number; // Computed: totalStock - reservedStock
    warehouse: {
        id: string;
        name: string;
        code: string;
        city: string;
        location: string;
    };
}

export interface ReservationWithDetails {
    id: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    status: ReservationStatus;
    expiresAt: Date;
    confirmedAt: Date | null;
    releasedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
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

export interface WarehouseWithInventory {
    id: string;
    name: string;
    code: string;
    location: string;
    city: string;
    country: string;
    isActive: boolean;
    inventories: Array<{
        productId: string;
        totalStock: number;
        reservedStock: number;
        availableStock: number;
    }>;
    totalSkus: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
