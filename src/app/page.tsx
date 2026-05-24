"use client";

import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    ApiError,
    createReservation,
    getProducts,
    Product,
    ProductInventory,
} from "../lib/api-client";
import { v4 as uuidv4 } from "uuid";

interface ReserveState {
    productId: string;
    warehouseId: string;
    quantity: number;
    loading: boolean;
    error: string | null;
}

function getStockClass(stock: number): string {
    if (stock === 0) return "stock-zero";
    if (stock <= 3) return "stock-low";
    if (stock <= 10) return "stock-medium";
    return "stock-high";
}

function formatPrice(price: string): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price));
}

function formatTimestamp(timestamp: string | null): string {
    if (!timestamp) return "Waiting for first sync";

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(timestamp));
}

function StatItem({
    label,
    value,
    caption,
}: {
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="stat-item">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-caption">{caption}</div>
        </div>
    );
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [reserveState, setReserveState] = useState<ReserveState | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getProducts({ page, search, limit: 20 });
            setProducts(response.data);
            setTotalPages(response.meta.totalPages);
            setTotal(response.meta.total);
            setLastUpdatedAt(new Date().toISOString());
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load products",
            );
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const initialLoad = setTimeout(() => {
            void fetchProducts();
        }, 0);
        const interval = setInterval(fetchProducts, 15000);
        return () => {
            clearTimeout(initialLoad);
            clearInterval(interval);
        };
    }, [fetchProducts]);

    useEffect(() => {
        return () => {
            if (searchDebounce.current) {
                clearTimeout(searchDebounce.current);
            }
        };
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);

        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }

        searchDebounce.current = setTimeout(() => {
            setSearch(value);
            setPage(1);
        }, 400);
    };

    const getQuantity = (productId: string, warehouseId: string) => {
        return quantities[`${productId}:${warehouseId}`] ?? 1;
    };

    const setQuantity = (
        productId: string,
        warehouseId: string,
        qty: number,
    ) => {
        setQuantities((previous) => ({
            ...previous,
            [`${productId}:${warehouseId}`]: qty,
        }));
    };

    const metrics = useMemo(() => {
        const warehouseIds = new Set<string>();
        let availableUnits = 0;
        let reservedUnits = 0;
        let lowStockProducts = 0;

        for (const product of products) {
            let productAvailability = 0;

            for (const inventory of product.inventories) {
                warehouseIds.add(inventory.warehouseId);
                availableUnits += inventory.availableStock;
                reservedUnits += inventory.reservedStock;
                productAvailability += inventory.availableStock;
            }

            if (productAvailability <= 3) {
                lowStockProducts += 1;
            }
        }

        return {
            warehouseCount: warehouseIds.size,
            availableUnits,
            reservedUnits,
            lowStockProducts,
        };
    }, [products]);

    const handleReserve = async (
        product: Product,
        warehouseId: string,
        quantity: number,
    ) => {
        setReserveState({
            productId: product.id,
            warehouseId,
            quantity,
            loading: true,
            error: null,
        });

        try {
            const idempotencyKey = uuidv4();
            const response = await createReservation({
                productId: product.id,
                warehouseId,
                quantity,
                idempotencyKey,
            });

            router.push(`/reservations/${response.data.id}`);
        } catch (error: unknown) {
            const message =
                error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                      ? error.message
                      : "Failed to create reservation";

            setReserveState((previous) =>
                previous
                    ? { ...previous, loading: false, error: message }
                    : null,
            );

            setTimeout(() => setReserveState(null), 5000);
        }
    };

    return (
        <div className="container py-8">
            <section className="hero-shell">
                <div className="hero-panel">
                    <div className="hero-copy">
                        <div className="hero-kicker">
                            <span className="status-dot" />
                            Live inventory
                        </div>
                        <div className="page-header">
                            <h1 className="page-title">
                                Inventory command center
                            </h1>
                            <p className="page-subtitle">
                                Review product availability across every
                                warehouse, expand a row to pick a fulfillment
                                location, and reserve stock without leaving the
                                table.
                            </p>
                        </div>
                        <div className="hero-actions">
                            <input
                                type="search"
                                className="input search-field"
                                placeholder="Search products, SKU, or category"
                                value={searchInput}
                                onChange={(event) =>
                                    handleSearchChange(event.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fetchProducts}
                                disabled={loading && products.length === 0}>
                                {loading && products.length === 0 ? (
                                    <>
                                        <span className="spinner spinner-sm" />
                                        Loading…
                                    </>
                                ) : (
                                    "Refresh feed"
                                )}
                            </button>
                        </div>
                        <div className="hero-status">
                            <span className="chip">
                                <span className="chip-dot" />
                                {loading && products.length > 0
                                    ? "Refreshing live stock"
                                    : "Live stock feed"}
                            </span>
                            <span className="chip">Polls every 15 seconds</span>
                            <span className="chip">
                                Expand a product to reserve
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hero-aside">
                    <div className="hero-summary">
                        <h2>Current sync</h2>
                        <p>{formatTimestamp(lastUpdatedAt)}</p>
                        <div className="hero-status">
                            <span className="chip">
                                <span
                                    className="chip-dot"
                                    style={{ background: "var(--success)" }}
                                />
                                {metrics.warehouseCount} warehouses
                            </span>
                            <span className="chip">
                                <span
                                    className="chip-dot"
                                    style={{ background: "var(--warning)" }}
                                />
                                {metrics.lowStockProducts} at-risk SKUs
                            </span>
                        </div>
                    </div>

                    <div className="panel-note">
                        <h3>Reserve flow</h3>
                        <p>
                            Select a warehouse, adjust the quantity, and submit
                            the reservation. The reservation detail page handles
                            confirmation and release.
                        </p>
                    </div>
                </div>
            </section>

            <section className="stat-strip">
                <StatItem
                    label="Visible SKUs"
                    value={String(total)}
                    caption={
                        total > 0
                            ? `of ${total} total records`
                            : "Waiting for data"
                    }
                />
                <StatItem
                    label="Warehouses"
                    value={String(metrics.warehouseCount)}
                    caption="Unique fulfillment locations in view"
                />
                <StatItem
                    label="Available units"
                    value={String(metrics.availableUnits)}
                    caption="Ready to reserve right now"
                />
                <StatItem
                    label="Reserved units"
                    value={String(metrics.reservedUnits)}
                    caption="Held across all warehouses"
                />
            </section>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {reserveState?.error && (
                <div className="alert alert-error mb-4">
                    <span>⚠</span>
                    <div>
                        <strong>Reservation Failed:</strong>{" "}
                        {reserveState.error}
                    </div>
                </div>
            )}

            {loading && products.length === 0 ? (
                <div className="empty-state">
                    <div
                        className="spinner"
                        style={{ margin: "0 auto 1rem" }}
                    />
                    <p>Loading products…</p>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p className="empty-state-title">No products found</p>
                    <p className="empty-state-desc">
                        {search
                            ? `No results for "${search}"`
                            : "No active products available"}
                    </p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    <div className="section">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Products</div>
                                <div className="section-note">
                                    Click any row to open warehouse availability
                                    and reserve stock.
                                </div>
                            </div>
                            <div className="table-meta">
                                {loading && products.length > 0 ? (
                                    <>
                                        <span className="spinner spinner-sm" />
                                        Updating live view
                                    </>
                                ) : (
                                    <>
                                        <span>{page}</span>
                                        <span>/</span>
                                        <span>{totalPages}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Price</th>
                                        <th>Available</th>
                                        <th style={{ textAlign: "right" }}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                        const totalAvailable =
                                            product.inventories.reduce<number>(
                                                (
                                                    sum: number,
                                                    inventory: ProductInventory,
                                                ) =>
                                                    sum +
                                                    inventory.availableStock,
                                                0,
                                            );
                                        const isExpanded =
                                            expandedProduct === product.id;

                                        return (
                                            <Fragment key={product.id}>
                                                <tr
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        setExpandedProduct(
                                                            isExpanded
                                                                ? null
                                                                : product.id,
                                                        )
                                                    }>
                                                    <td>
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gap: "0.35rem",
                                                            }}>
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                }}>
                                                                {product.name}
                                                            </div>
                                                            {product.description && (
                                                                <div
                                                                    className="text-muted truncate"
                                                                    style={{
                                                                        fontSize:
                                                                            "0.8125rem",
                                                                        maxWidth:
                                                                            "32rem",
                                                                    }}>
                                                                    {
                                                                        product.description
                                                                    }
                                                                </div>
                                                            )}
                                                            <div className="table-meta">
                                                                {product.category ? (
                                                                    <span
                                                                        className="chip"
                                                                        style={{
                                                                            padding:
                                                                                "0.25rem 0.55rem",
                                                                        }}>
                                                                        {
                                                                            product.category
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="section-note">
                                                                        Uncategorized
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-mono text-muted">
                                                        {product.sku}
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 700,
                                                        }}>
                                                        {formatPrice(
                                                            product.price,
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`stock-pill ${getStockClass(totalAvailable)}`}>
                                                            {totalAvailable ===
                                                            0
                                                                ? "Out of stock"
                                                                : totalAvailable}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: "right",
                                                        }}>
                                                        <span className="section-note">
                                                            {isExpanded
                                                                ? "Hide warehouses"
                                                                : "Choose warehouse"}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            style={{
                                                                padding: 0,
                                                            }}>
                                                            <div
                                                                className="section"
                                                                style={{
                                                                    margin: "0 0 1rem",
                                                                }}>
                                                                <div className="section-header">
                                                                    <div>
                                                                        <div className="section-title">
                                                                            Warehouse
                                                                            availability
                                                                        </div>
                                                                        <div className="section-note">
                                                                            {
                                                                                product
                                                                                    .inventories
                                                                                    .length
                                                                            }{" "}
                                                                            warehouse
                                                                            {product
                                                                                .inventories
                                                                                .length ===
                                                                            1
                                                                                ? ""
                                                                                : "s"}{" "}
                                                                            carry
                                                                            this
                                                                            SKU.
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-meta">
                                                                        <span className="stock-pill">
                                                                            {
                                                                                totalAvailable
                                                                            }{" "}
                                                                            ready
                                                                            to
                                                                            reserve
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="table-container">
                                                                    <table
                                                                        style={{
                                                                            marginBottom: 0,
                                                                        }}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>
                                                                                    Warehouse
                                                                                </th>
                                                                                <th>
                                                                                    Location
                                                                                </th>
                                                                                <th>
                                                                                    Available
                                                                                </th>
                                                                                <th>
                                                                                    Reserved
                                                                                </th>
                                                                                <th>
                                                                                    Total
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "280px",
                                                                                    }}>
                                                                                    Reserve
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {product.inventories.map(
                                                                                (
                                                                                    inventory,
                                                                                ) => {
                                                                                    const qty =
                                                                                        getQuantity(
                                                                                            product.id,
                                                                                            inventory.warehouseId,
                                                                                        );
                                                                                    const isReserving =
                                                                                        reserveState?.loading &&
                                                                                        reserveState.productId ===
                                                                                            product.id &&
                                                                                        reserveState.warehouseId ===
                                                                                            inventory.warehouseId;

                                                                                    return (
                                                                                        <tr
                                                                                            key={
                                                                                                inventory.id
                                                                                            }>
                                                                                            <td>
                                                                                                <div
                                                                                                    style={{
                                                                                                        fontWeight: 700,
                                                                                                    }}>
                                                                                                    {
                                                                                                        inventory
                                                                                                            .warehouse
                                                                                                            .name
                                                                                                    }
                                                                                                </div>
                                                                                                <div
                                                                                                    className="text-mono text-muted"
                                                                                                    style={{
                                                                                                        fontSize:
                                                                                                            "0.75rem",
                                                                                                    }}>
                                                                                                    {
                                                                                                        inventory
                                                                                                            .warehouse
                                                                                                            .code
                                                                                                    }
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="text-muted">
                                                                                                {
                                                                                                    inventory
                                                                                                        .warehouse
                                                                                                        .city
                                                                                                }
                                                                                            </td>
                                                                                            <td>
                                                                                                <span
                                                                                                    className={`stock-pill ${getStockClass(
                                                                                                        inventory.availableStock,
                                                                                                    )}`}>
                                                                                                    {inventory.availableStock ===
                                                                                                    0
                                                                                                        ? "Out of stock"
                                                                                                        : inventory.availableStock}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="text-muted">
                                                                                                {
                                                                                                    inventory.reservedStock
                                                                                                }
                                                                                            </td>
                                                                                            <td className="text-muted">
                                                                                                {
                                                                                                    inventory.totalStock
                                                                                                }
                                                                                            </td>
                                                                                            <td>
                                                                                                <div
                                                                                                    style={{
                                                                                                        display:
                                                                                                            "flex",
                                                                                                        alignItems:
                                                                                                            "center",
                                                                                                        gap: "0.625rem",
                                                                                                    }}>
                                                                                                    <div className="qty-selector">
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            className="qty-btn"
                                                                                                            disabled={
                                                                                                                qty <=
                                                                                                                    1 ||
                                                                                                                inventory.availableStock ===
                                                                                                                    0
                                                                                                            }
                                                                                                            onClick={(
                                                                                                                event,
                                                                                                            ) => {
                                                                                                                event.stopPropagation();
                                                                                                                setQuantity(
                                                                                                                    product.id,
                                                                                                                    inventory.warehouseId,
                                                                                                                    Math.max(
                                                                                                                        1,
                                                                                                                        qty -
                                                                                                                            1,
                                                                                                                    ),
                                                                                                                );
                                                                                                            }}>
                                                                                                            −
                                                                                                        </button>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="qty-input"
                                                                                                            value={
                                                                                                                qty
                                                                                                            }
                                                                                                            min={
                                                                                                                1
                                                                                                            }
                                                                                                            max={
                                                                                                                inventory.availableStock
                                                                                                            }
                                                                                                            disabled={
                                                                                                                inventory.availableStock ===
                                                                                                                0
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                event,
                                                                                                            ) => {
                                                                                                                event.stopPropagation();
                                                                                                                const nextQuantity =
                                                                                                                    Math.min(
                                                                                                                        Math.max(
                                                                                                                            1,
                                                                                                                            Number(
                                                                                                                                event
                                                                                                                                    .target
                                                                                                                                    .value,
                                                                                                                            ),
                                                                                                                        ),
                                                                                                                        inventory.availableStock,
                                                                                                                    );
                                                                                                                setQuantity(
                                                                                                                    product.id,
                                                                                                                    inventory.warehouseId,
                                                                                                                    nextQuantity,
                                                                                                                );
                                                                                                            }}
                                                                                                            onClick={(
                                                                                                                event,
                                                                                                            ) =>
                                                                                                                event.stopPropagation()
                                                                                                            }
                                                                                                        />
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            className="qty-btn"
                                                                                                            disabled={
                                                                                                                qty >=
                                                                                                                inventory.availableStock
                                                                                                            }
                                                                                                            onClick={(
                                                                                                                event,
                                                                                                            ) => {
                                                                                                                event.stopPropagation();
                                                                                                                setQuantity(
                                                                                                                    product.id,
                                                                                                                    inventory.warehouseId,
                                                                                                                    Math.min(
                                                                                                                        inventory.availableStock,
                                                                                                                        qty +
                                                                                                                            1,
                                                                                                                    ),
                                                                                                                );
                                                                                                            }}>
                                                                                                            +
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="btn btn-primary btn-sm"
                                                                                                        disabled={
                                                                                                            inventory.availableStock ===
                                                                                                                0 ||
                                                                                                            !!reserveState?.loading
                                                                                                        }
                                                                                                        onClick={(
                                                                                                            event,
                                                                                                        ) => {
                                                                                                            event.stopPropagation();
                                                                                                            handleReserve(
                                                                                                                product,
                                                                                                                inventory.warehouseId,
                                                                                                                qty,
                                                                                                            );
                                                                                                        }}>
                                                                                                        {isReserving ? (
                                                                                                            <>
                                                                                                                <span className="spinner spinner-sm" />
                                                                                                                Reserving…
                                                                                                            </>
                                                                                                        ) : inventory.availableStock ===
                                                                                                          0 ? (
                                                                                                            "Out of stock"
                                                                                                        ) : (
                                                                                                            "Reserve"
                                                                                                        )}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "1rem",
                                    padding: "1rem 1.25rem 1.25rem",
                                }}>
                                <span className="section-note">
                                    Page {page} of {totalPages}
                                </span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((current) => current - 1)
                                        }>
                                        ← Previous
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        disabled={page >= totalPages}
                                        onClick={() =>
                                            setPage((current) => current + 1)
                                        }>
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="side-rail">
                        <div className="side-stack">
                            <h3>Read the stock signal</h3>
                            <p>
                                The inventory list is filtered in real time. Low
                                or empty product rows are exposed first so you
                                can reserve before the page goes stale.
                            </p>
                            <ul>
                                <li>
                                    <span
                                        className={`stock-pill ${getStockClass(11)}`}>
                                        Healthy
                                    </span>
                                    stock above 10 units.
                                </li>
                                <li>
                                    <span
                                        className={`stock-pill ${getStockClass(5)}`}>
                                        Caution
                                    </span>
                                    stock between 4 and 10 units.
                                </li>
                                <li>
                                    <span
                                        className={`stock-pill ${getStockClass(2)}`}>
                                        Low
                                    </span>
                                    stock between 1 and 3 units.
                                </li>
                                <li>
                                    <span
                                        className={`stock-pill ${getStockClass(0)}`}>
                                        Empty
                                    </span>
                                    warehouse has no available units.
                                </li>
                            </ul>
                        </div>

                        <div className="side-stack">
                            <h3>Reserve flow</h3>
                            <ul>
                                <li>
                                    Open a product row to reveal warehouse level
                                    inventory.
                                </li>
                                <li>
                                    Adjust quantity with the stepper or type a
                                    number directly.
                                </li>
                                <li>
                                    Reserve redirects into the reservation
                                    detail page for final action.
                                </li>
                            </ul>
                        </div>

                        <div className="side-stack">
                            <h3>Warehouse snapshot</h3>
                            <p>
                                {metrics.warehouseCount} active fulfillment
                                locations are in view.
                            </p>
                            <div
                                className="hero-status"
                                style={{ marginTop: "0.75rem" }}>
                                <span className="chip">
                                    {metrics.availableUnits} ready units
                                </span>
                                <span className="chip">
                                    {metrics.reservedUnits} reserved units
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
