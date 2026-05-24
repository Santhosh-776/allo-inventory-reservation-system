"use client";

import { useState } from "react";
import { LoadingState, ErrorState } from "../../../components/ui";
import { useProducts } from "../../../hooks";
import { ProductFilters } from "../ProductFilters";
import { ProductsTable } from "../ProductsTable";

export function ProductsPageView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { data, meta, loading, error } = useProducts(page, 20, search);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading products..." />;
    }

    if (error && data.length === 0) {
        return (
            <ErrorState
                message={error.message}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Products</h1>
                <p className="page-subtitle">
                    Browse products and reserve inventory across warehouses
                </p>
            </div>

            <ProductFilters
                onSearch={(s) => {
                    setSearch(s);
                    setPage(1);
                }}
                onRefresh={() => setPage(1)}
            />

            <div className="section">
                <div className="section-header">
                    <span className="section-title">
                        Product Inventory
                    </span>
                    {meta && (
                        <span className="section-note">
                            {meta.total} product{meta.total !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <ProductsTable
                    products={data}
                    onRefresh={() => setPage(1)}
                />
            </div>

            {meta && meta.totalPages > 1 && (
                <div className="control-bar" style={{ marginTop: "1rem" }}>
                    <p className="table-meta">
                        Showing {(page - 1) * 20 + 1}–
                        {Math.min(page * 20, meta.total)} of {meta.total}
                    </p>
                    <div className="control-group">
                        {meta.hasPrevPage && (
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className="btn btn-secondary btn-sm">
                                ← Previous
                            </button>
                        )}
                        <span className="table-meta">Page {page}</span>
                        {meta.hasNextPage && (
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                className="btn btn-secondary btn-sm">
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
