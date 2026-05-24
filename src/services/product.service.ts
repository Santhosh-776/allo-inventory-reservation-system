import prisma from "../lib/prisma";
import { logger } from "../utils/logger";
import { ProductWithInventory, PaginationMeta } from "../types";
import type { Prisma } from "../../app/generated/prisma/client";

interface ListProductsParams {
    page: number;
    limit: number;
    category?: string;
    search?: string;
}

interface ListProductsResult {
    products: ProductWithInventory[];
    meta: PaginationMeta;
}

/**
 * Fetches paginated products with their full warehouse inventory breakdown.
 */
export async function listProducts(
    params: ListProductsParams,
): Promise<ListProductsResult> {
    const { page, limit, category, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
        isActive: true,
        ...(category
            ? { category: { equals: category, mode: "insensitive" } }
            : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { sku: { contains: search, mode: "insensitive" } },
                      {
                          description: {
                              contains: search,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),
    };

    const [rawProducts, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                inventories: {
                    include: {
                        warehouse: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                city: true,
                                location: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.product.count({ where }),
    ]);

    // Compute availableStock for each inventory entry
    const products: ProductWithInventory[] = rawProducts.map((p) => ({
        ...p,
        price: p.price.toString(),
        inventories: p.inventories.map((inv) => ({
            ...inv,
            availableStock: inv.totalStock - inv.reservedStock,
        })),
    }));

    logger.info("Fetched product list", {
        page,
        limit,
        total,
        category,
        search,
    });

    return {
        products,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
}

/**
 * Fetches a single product by ID with inventory details.
 */
export async function getProductById(
    productId: string,
): Promise<ProductWithInventory> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            inventories: {
                include: {
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            city: true,
                            location: true,
                        },
                    },
                },
            },
        },
    });

    if (!product) {
        const { AppError } = await import("../utils/AppError");
        throw AppError.notFound("Product");
    }

    return {
        ...product,
        price: product.price.toString(),
        inventories: product.inventories.map((inv) => ({
            ...inv,
            availableStock: inv.totalStock - inv.reservedStock,
        })),
    };
}
