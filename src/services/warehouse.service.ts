import prisma from "../lib/prisma";
import { logger } from "../utils/logger";
import { WarehouseWithInventory } from "../types";

/**
 * Fetches all active warehouses with their inventory summary.
 */
export async function listWarehouses(): Promise<WarehouseWithInventory[]> {
    const warehouses = await prisma.warehouse.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
            inventories: {
                select: {
                    productId: true,
                    totalStock: true,
                    reservedStock: true,
                },
            },
        },
    });

    const result: WarehouseWithInventory[] = warehouses.map((wh) => ({
        ...wh,
        inventories: wh.inventories.map((inv) => ({
            ...inv,
            availableStock: inv.totalStock - inv.reservedStock,
        })),
        totalSkus: wh.inventories.length,
    }));

    logger.info("Fetched warehouse list", { count: result.length });
    return result;
}

/**
 * Fetches a single warehouse by ID.
 */
export async function getWarehouseById(
    warehouseId: string,
): Promise<WarehouseWithInventory> {
    const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: {
            inventories: {
                select: {
                    productId: true,
                    totalStock: true,
                    reservedStock: true,
                },
            },
        },
    });

    if (!warehouse) {
        const { AppError } = await import("../utils/AppError");
        throw AppError.notFound("Warehouse");
    }

    return {
        ...warehouse,
        inventories: warehouse.inventories.map((inv) => ({
            ...inv,
            availableStock: inv.totalStock - inv.reservedStock,
        })),
        totalSkus: warehouse.inventories.length,
    };
}

/**
 * Returns all inventory records across all warehouses.
 * Used by the admin inventory route.
 */
export async function getAllInventory() {
    const records = await prisma.inventory.findMany({
        include: {
            product: { select: { id: true, name: true, sku: true } },
            warehouse: { select: { id: true, name: true, code: true, city: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return records.map((inv) => ({
        ...inv,
        availableStock: inv.totalStock - inv.reservedStock,
    }));
}

/**
 * Updates the total and reserved stock for a product-warehouse pair.
 * Used by the admin inventory management route.
 */
export async function updateInventory(
    productId: string,
    warehouseId: string,
    totalStock: number,
    reservedStock: number,
) {
    const updated = await prisma.inventory.upsert({
        where: { productId_warehouseId: { productId, warehouseId } },
        update: { totalStock, reservedStock },
        create: { productId, warehouseId, totalStock, reservedStock },
        include: {
            product: { select: { id: true, name: true, sku: true } },
            warehouse: { select: { id: true, name: true, code: true, city: true } },
        },
    });

    logger.info("Inventory updated", { productId, warehouseId, totalStock, reservedStock });

    return {
        ...updated,
        availableStock: updated.totalStock - updated.reservedStock,
    };
}
