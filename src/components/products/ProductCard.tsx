"use client";

import Image from "next/image";
import { ProductWithInventory } from "../../types";
import { Button, StockBadge } from "../ui";

interface ProductCardProps {
    product: ProductWithInventory;
    onReserve?: (product: ProductWithInventory) => void;
}

const categoryColors: Record<string, string> = {
    Antibiotics: "bg-red-100 text-red-800",
    "Pain Relief": "bg-orange-100 text-orange-800",
    Cardiovascular: "bg-blue-100 text-blue-800",
    Diabetes: "bg-purple-100 text-purple-800",
    Endocrine: "bg-pink-100 text-pink-800",
    "Anti-inflammatory": "bg-yellow-100 text-yellow-800",
    Psychiatric: "bg-indigo-100 text-indigo-800",
};

export function ProductCard({ product, onReserve }: ProductCardProps) {
    const totalStock = product.inventories.reduce(
        (sum, inv) => sum + (inv.totalStock - inv.reservedStock),
        0
    );
    const categoryColor = categoryColors[product.category || ""] || "bg-gray-100 text-gray-800";
    const hasStock = totalStock > 0;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <span className="text-blue-400 text-4xl">💊</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Category Badge */}
                <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${categoryColor}`}>
                        {product.category || "Uncategorized"}
                    </span>
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 text-sm">
                    {product.name}
                </h3>

                {/* SKU */}
                <p className="text-xs text-slate-500 mb-2">SKU: {product.sku}</p>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-3 line-clamp-2 flex-grow">
                    {product.description}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-3 pt-2 border-t border-slate-200">
                    <div>
                        <p className="text-sm font-bold text-slate-900">₹{product.price}</p>
                        <p className="text-xs text-slate-500">per unit</p>
                    </div>
                    <StockBadge stock={totalStock} reserved={0} total={totalStock} />
                </div>

                {/* Warehouses */}
                <div className="mb-3 bg-slate-50 rounded p-2">
                    <p className="text-xs font-medium text-slate-700 mb-1">📦 Available in:</p>
                    <div className="flex flex-wrap gap-1">
                        {product.inventories.slice(0, 3).map((inv) => (
                            <span key={inv.id} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                                {inv.warehouse.name.split(" ")[0]}:{" "}
                                {inv.totalStock - inv.reservedStock}
                            </span>
                        ))}
                        {product.inventories.length > 3 && (
                            <span className="text-xs px-2 py-1">+{product.inventories.length - 3} more</span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => onReserve?.(product)}
                    disabled={!hasStock}
                    className="w-full mt-auto"
                    variant={hasStock ? "primary" : "secondary"}
                >
                    {hasStock ? "Reserve Now" : "Out of Stock"}
                </Button>
            </div>
        </div>
    );
}
