import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "../utils/response";

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

/**
 * POST /api/v1/products
 * Creates a new product.
 */
export const createProductController = asyncHandler(async (req: NextRequest) => {
    logRequest(req);
    const body = await req.json();

    const { name, sku, description, price, category, imageUrl } = body;

    if (!name || !sku || price === undefined) {
        return sendError("Missing required fields: name, sku, price", 400, "BAD_REQUEST");
    }


    const product = await productService.createProduct({
        name,
        sku,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
    });

    return sendSuccess(product, "Product created successfully", 201);
});

/**
 * DELETE /api/v1/products/:id
 * Soft deletes a product by marking it as inactive.
 */
export const deleteProductController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ) => {
        logRequest(req);
        const params = await context?.params;
        const productId = params?.id ?? "";

        await productService.deleteProduct(productId);

        return sendSuccess(null, "Product deleted successfully");
    },
);
