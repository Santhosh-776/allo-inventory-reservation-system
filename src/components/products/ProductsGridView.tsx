"use client";

import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { ProductWithInventory } from "../../types";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ReserveDialog } from "./ReserveDialog";
import { Spinner, ErrorState, EmptyState } from "../ui";

export function ProductsGridView() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedInventory, setSelectedInventory] = useState<{
        productId: string;
        productName: string;
        warehouseId: string;
        warehouseName: string;
        maxStock: number;
    } | null>(null);

    const { data, loading, error } = useProducts(page, 20, search);

    const handleProductReserve = (product: ProductWithInventory) => {
        const bestWarehouse = product.inventories
            .filter((inv) => inv.availableStock > 0)
            .sort((a, b) => b.availableStock - a.availableStock)[0];

        if (bestWarehouse) {
            setSelectedInventory({
                productId: product.id,
                productName: product.name,
                warehouseId: bestWarehouse.warehouseId,
                warehouseName: bestWarehouse.warehouse.name,
                maxStock: bestWarehouse.availableStock,
            });
        }
    };

    return (
        <>
            <ProductFilters
                onSearch={(s) => { setSearch(s); setPage(1); }}
                onRefresh={() => setPage(1)}
            />

            {loading && data.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                    <Spinner />
                </div>
            ) : error ? (
                <ErrorState
                    message="Failed to load products"
                    onRetry={() => setPage(1)}
                />
            ) : data.length === 0 ? (
                <EmptyState message="No products found matching your search" />
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                    {data.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onReserve={handleProductReserve}
                        />
                    ))}
                </div>
            )}

            {selectedInventory && (
                <ReserveDialog
                    isOpen={true}
                    productId={selectedInventory.productId}
                    productName={selectedInventory.productName}
                    warehouseId={selectedInventory.warehouseId}
                    warehouseName={selectedInventory.warehouseName}
                    maxStock={selectedInventory.maxStock}
                    onClose={() => setSelectedInventory(null)}
                    onSuccess={() => setSelectedInventory(null)}
                />
            )}
        </>
    );
}
