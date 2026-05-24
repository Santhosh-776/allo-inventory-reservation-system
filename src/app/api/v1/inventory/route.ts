import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "../../../../utils/response";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { logRequest } from "../../../../middlewares/logger.middleware";
import * as warehouseService from "../../../../services/warehouse.service";

/**
 * GET /api/v1/inventory
 * Returns all inventory records across warehouses.
 */
export const GET = asyncHandler(async (req: NextRequest) => {
    logRequest(req);
    const inventory = await warehouseService.getAllInventory();
    return sendSuccess(inventory, "Inventory retrieved successfully");
});

/**
 * PUT /api/v1/inventory
 * Updates inventory stock levels for a product-warehouse pair.
 */
export const PUT = asyncHandler(async (req: NextRequest) => {
    logRequest(req);
    const body = await req.json();
    const { productId, warehouseId, totalStock, reservedStock } = body;

    if (!productId || !warehouseId || totalStock === undefined) {
        return sendError(
            "Missing required fields: productId, warehouseId, totalStock",
            400,
            "BAD_REQUEST",
        );
    }

    const updatedInventory = await warehouseService.updateInventory(
        productId,
        warehouseId,
        totalStock,
        reservedStock || 0,
    );

    return sendSuccess(updatedInventory, "Inventory updated successfully");
});
