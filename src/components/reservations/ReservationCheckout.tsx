"use client";

import { Button, ErrorState, Spinner } from "../../components/ui";
import { ReservationWithDetails } from "../../types";
import { useConfirmReservation, useReleaseReservation } from "../../hooks";
import { ReservationTimer } from "./ReservationTimer";

interface ReservationCheckoutProps {
    reservation: ReservationWithDetails;
    onStatusChange?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    RELEASED: "Released",
    EXPIRED: "Expired",
};

const STATUS_CLASS: Record<string, string> = {
    PENDING: "badge badge-pending",
    CONFIRMED: "badge badge-confirmed",
    RELEASED: "badge badge-released",
    EXPIRED: "badge badge-expired",
};

export function ReservationCheckout({
    reservation,
    onStatusChange,
}: ReservationCheckoutProps) {
    const {
        loading: confirmLoading,
        error: confirmError,
        confirm,
    } = useConfirmReservation();
    const {
        loading: releaseLoading,
        error: releaseError,
        release,
    } = useReleaseReservation();

    const handleConfirm = async () => {
        await confirm(reservation.id);
        onStatusChange?.();
    };

    const handleRelease = async () => {
        await release(reservation.id);
        onStatusChange?.();
    };

    const isLoading = confirmLoading || releaseLoading;
    const error = confirmError || releaseError;
    const isPending = reservation.status === "PENDING";
    const isExpired = reservation.status === "EXPIRED";
    const isConfirmed = reservation.status === "CONFIRMED";
    const isReleased = reservation.status === "RELEASED";

    // expiresAt may arrive as Date or ISO string from API
    const expiresAtStr =
        reservation.expiresAt instanceof Date
            ? reservation.expiresAt.toISOString()
            : String(reservation.expiresAt);

    const totalAmount = (
        Number(reservation.product.price) * reservation.quantity
    ).toFixed(2);

    return (
        <div>
            {/* Summary section */}
            <div className="section" style={{ marginBottom: "1rem" }}>
                <div className="section-header">
                    <span className="section-title">Reservation Summary</span>
                    <span className={STATUS_CLASS[reservation.status] || "badge"}>
                        {STATUS_LABEL[reservation.status] || reservation.status}
                    </span>
                </div>
                <div className="section-body">
                    <div className="info-row">
                        <span className="info-label">Reservation ID</span>
                        <span
                            className="info-value"
                            style={{
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                            }}>
                            {reservation.id}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Product</span>
                        <span className="info-value">
                            {reservation.product.name}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">SKU</span>
                        <span
                            className="info-value"
                            style={{ color: "var(--text-muted)" }}>
                            {reservation.product.sku}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Warehouse</span>
                        <span className="info-value">
                            {reservation.warehouse.name} ·{" "}
                            {reservation.warehouse.city}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">
                            {reservation.quantity} unit
                            {reservation.quantity !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Unit Price</span>
                        <span className="info-value">
                            ₹{reservation.product.price}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Total Amount</span>
                        <span
                            className="info-value"
                            style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            ₹{totalAmount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timer — only for PENDING */}
            {isPending && (
                <div style={{ marginBottom: "1rem" }}>
                    <ReservationTimer expiresAt={expiresAtStr} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ marginBottom: "1rem" }}>
                    <ErrorState message={error.message} />
                </div>
            )}

            {/* Actions */}
            {isPending && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        style={{ flex: 1 }}>
                        {confirmLoading ? <Spinner /> : "Confirm Purchase"}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleRelease}
                        disabled={isLoading}>
                        {releaseLoading ? <Spinner /> : "Cancel"}
                    </button>
                </div>
            )}

            {isConfirmed && (
                <div className="alert alert-success">
                    <span>✓</span>
                    <div>
                        <p style={{ fontWeight: 600 }}>Purchase Confirmed</p>
                        <p>
                            Your order is confirmed and inventory has been
                            permanently allocated.
                        </p>
                    </div>
                </div>
            )}

            {isExpired && (
                <div className="alert alert-error">
                    <span>✕</span>
                    <div>
                        <p style={{ fontWeight: 600 }}>Reservation Expired</p>
                        <p>
                            This reservation is no longer valid. Please create a
                            new one.
                        </p>
                    </div>
                </div>
            )}

            {isReleased && (
                <div className="alert alert-warning">
                    <span>↩</span>
                    <div>
                        <p style={{ fontWeight: 600 }}>Reservation Released</p>
                        <p>Stock has been returned to inventory.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
