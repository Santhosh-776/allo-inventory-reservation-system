import { NextRequest } from "next/server";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import { logRequest } from "../middlewares/logger.middleware";
import * as warehouseService from "../services/warehouse.service";

/**
 * GET /api/v1/warehouses
 * Returns all active warehouses with inventory summary.
 */
export const listWarehousesController = asyncHandler(
    async (req: NextRequest) => {
        logRequest(req);
        const warehouses = await warehouseService.listWarehouses();
        return sendSuccess(warehouses, "Warehouses retrieved successfully");
    },
);

/**
 * GET /api/v1/warehouses/:id
 * Returns a single warehouse with inventory details.
 */
export const getWarehouseController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ) => {
        logRequest(req);
        const params = await context?.params;
        const warehouseId = params?.id ?? "";

        const warehouse = await warehouseService.getWarehouseById(warehouseId);
        return sendSuccess(warehouse, "Warehouse retrieved successfully");
    },
);
