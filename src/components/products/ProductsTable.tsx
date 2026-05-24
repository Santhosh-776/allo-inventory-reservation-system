"use client";

import { useState } from "react";
import { EmptyState } from "../../components/ui";
import { ProductWithInventory } from "../../types";
import { ReserveDialog } from "./ReserveDialog";

interface ProductsTableProps {
    products: ProductWithInventory[];
    onRefresh?: () => void;
}

interface SelectedInventory {
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    available: number;
}

function StockIndicator({ available, total }: { available: number; total: number }) {
    const pct = total > 0 ? available / total : 0;
    const cls =
        available === 0
            ? "stock-zero"
            : pct < 0.2
              ? "stock-low"
              : pct < 0.5
                ? "stock-medium"
                : "stock-high";

    return (
        <span className={cls}>
            {available === 0 ? "—" : available}
        </span>
    );
}

export function ProductsTable({ products, onRefresh }: ProductsTableProps) {
    const [selected, setSelected] = useState<SelectedInventory | null>(null);

    if (products.length === 0) {
        return <EmptyState message="No products found" />;
    }

    return (
        <>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Warehouse</th>
                            <th style={{ textAlign: "right" }}>Available</th>
                            <th style={{ textAlign: "right" }}>Reserved</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            if (product.inventories.length === 0) {
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div>
                                                <p style={{ fontWeight: 500 }}>
                                                    {product.name}
                                                </p>
                                                {product.description && (
                                                    <p
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            color: "var(--text-muted)",
                                                        }}>
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--text-muted)" }}>
                                            {product.sku}
                                        </td>
                                        <td>₹{product.price}</td>
                                        <td
                                            colSpan={4}
                                            style={{
                                                color: "var(--text-muted)",
                                                fontStyle: "italic",
                                            }}>
                                            No inventory configured
                                        </td>
                                    </tr>
                                );
                            }

                            return product.inventories.map((inv, idx) => (
                                <tr key={`${product.id}-${inv.id}`}>
                                    {idx === 0 && (
                                        <>
                                            <td
                                                rowSpan={
                                                    product.inventories.length
                                                }>
                                                <div>
                                                    <p
                                                        style={{
                                                            fontWeight: 500,
                                                        }}>
                                                        {product.name}
                                                    </p>
                                                    {product.description && (
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "0.8rem",
                                                                color: "var(--text-muted)",
                                                            }}>
                                                            {
                                                                product.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                rowSpan={
                                                    product.inventories.length
                                                }
                                                style={{
                                                    color: "var(--text-muted)",
                                                }}>
                                                {product.sku}
                                            </td>
                                            <td
                                                rowSpan={
                                                    product.inventories.length
                                                }>
                                                ₹{product.price}
                                            </td>
                                        </>
                                    )}
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                                {inv.warehouse.name}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                }}>
                                                {inv.warehouse.code} ·{" "}
                                                {inv.warehouse.city}
                                            </p>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <StockIndicator
                                            available={inv.availableStock}
                                            total={inv.totalStock}
                                        />
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "right",
                                            color: "var(--text-muted)",
                                            fontSize: "0.875rem",
                                        }}>
                                        {inv.reservedStock}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        {inv.availableStock > 0 ? (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() =>
                                                    setSelected({
                                                        productId: product.id,
                                                        productName:
                                                            product.name,
                                                        warehouseId:
                                                            inv.warehouseId,
                                                        warehouseName:
                                                            inv.warehouse.name,
                                                        available:
                                                            inv.availableStock,
                                                    })
                                                }>
                                                Reserve
                                            </button>
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "var(--text-muted)",
                                                    fontStyle: "italic",
                                                }}>
                                                Out of stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>

            {selected && (
                <ReserveDialog
                    isOpen={true}
                    onClose={() => setSelected(null)}
                    productId={selected.productId}
                    productName={selected.productName}
                    warehouseId={selected.warehouseId}
                    warehouseName={selected.warehouseName}
                    maxStock={selected.available}
                    onSuccess={onRefresh}
                />
            )}
        </>
    );
}
