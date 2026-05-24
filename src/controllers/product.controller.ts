import { NextRequest } from "next/server";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import { validateQuery } from "../middlewares/validation.middleware";
import { logRequest } from "../middlewares/logger.middleware";
import { ListProductsSchema } from "../validators/product.validator";
import * as productService from "../services/product.service";

/**
 * GET /api/v1/products
 * Returns paginated product list with warehouse inventory breakdown.
 */
export const listProductsController = asyncHandler(async (req: NextRequest) => {
    const { startTime } = logRequest(req);

    const { data: query, error } = validateQuery(req, ListProductsSchema);
    if (error) return error;

    const result = await productService.listProducts(query);

    return sendSuccess(
        result.products,
        "Products retrieved successfully",
        200,
        result.meta as object,
    );
});

/**
 * GET /api/v1/products/:id
 * Returns a single product with inventory details.
 */
export const getProductController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ) => {
        logRequest(req);
        const params = await context?.params;
        const productId = params?.id ?? "";

        const product = await productService.getProductById(productId);

        return sendSuccess(product, "Product retrieved successfully");
    },
);
