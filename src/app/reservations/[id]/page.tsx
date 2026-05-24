"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ApiError,
    Reservation,
    confirmReservation,
    getReservation,
    releaseReservation,
} from "../../../lib/api-client";

function useCountdown(expiresAt: string | null) {
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;

        const updateCountdown = () => {
            const diff = Math.max(
                0,
                Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
            );
            setSecondsLeft(diff);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return {
        secondsLeft,
        minutes,
        seconds,
        isExpired: secondsLeft === 0,
        isUrgent: secondsLeft > 0 && secondsLeft <= 60,
        isWarning: secondsLeft > 60 && secondsLeft <= 180,
        formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    };
}

function formatPrice(price: string): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price));
}

function formatDateTime(timestamp: string | null): string {
    if (!timestamp) return "—";

    return new Date(timestamp).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
    });
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    );
}

function TimelineItem({
    label,
    value,
    active,
    isWarning,
    isDanger,
}: {
    label: string;
    value: string;
    active?: boolean;
    isWarning?: boolean;
    isDanger?: boolean;
}) {
    return (
        <div className="timeline-item">
            <div
                className={`timeline-marker ${
                    isDanger
                        ? "is-danger"
                        : isWarning
                          ? "is-warning"
                          : active
                            ? "is-active"
                            : ""
                }`}
            />
            <div>
                <div
                    className={`timeline-title ${
                        isDanger
                            ? "is-danger"
                            : isWarning
                              ? "is-warning"
                              : active
                                ? "is-active"
                                : ""
                    }`}>
                    {label}
                </div>
                <div className="timeline-value">{value}</div>
            </div>
        </div>
    );
}

export default function ReservationPage() {
    const params = useParams<{ id: string }>();
    const reservationId = params.id;

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<
        "confirm" | "release" | null
    >(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const countdown = useCountdown(
        reservation?.status === "PENDING" ? reservation.expiresAt : null,
    );

    const fetchReservation = useCallback(async () => {
        try {
            const response = await getReservation(reservationId);
            setReservation(response.data);
            setError(null);
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load reservation",
            );
        } finally {
            setLoading(false);
        }
    }, [reservationId]);

    useEffect(() => {
        const initialLoad = setTimeout(() => {
            void fetchReservation();
        }, 0);
        const interval = setInterval(fetchReservation, 5000);
        return () => {
            clearTimeout(initialLoad);
            clearInterval(interval);
        };
    }, [fetchReservation]);

    useEffect(() => {
        if (countdown.isExpired && reservation?.status === "PENDING") {
            const timeout = setTimeout(fetchReservation, 1500);
            return () => clearTimeout(timeout);
        }

        return undefined;
    }, [countdown.isExpired, reservation?.status, fetchReservation]);

    const handleConfirm = async () => {
        setActionLoading("confirm");
        setActionError(null);
        setActionSuccess(null);

        try {
            const response = await confirmReservation(reservationId);
            setReservation(response.data);
            setActionSuccess(
                "Reservation confirmed. Stock has been permanently decremented.",
            );
        } catch (error: unknown) {
            const message =
                error instanceof ApiError
                    ? `${error.message}${error.statusCode === 410 ? " (Reservation expired)" : ""}`
                    : error instanceof Error
                      ? error.message
                      : "Failed to confirm reservation";
            setActionError(message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRelease = async () => {
        setActionLoading("release");
        setActionError(null);
        setActionSuccess(null);

        try {
            const response = await releaseReservation(reservationId);
            setReservation(response.data);
            setActionSuccess("Reservation released. Stock has been returned.");
        } catch (error: unknown) {
            const message =
                error instanceof ApiError
                    ? error.message
                    : "Failed to release reservation";
            setActionError(message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <div className="empty-state">
                    <div
                        className="spinner"
                        style={{ margin: "0 auto 1rem" }}
                    />
                    <p>Loading reservation…</p>
                </div>
            </div>
        );
    }

    if (error && !reservation) {
        return (
            <div className="container py-8">
                <div className="alert alert-error mb-6">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
                <Link
                    href="/"
                    className="btn btn-secondary">
                    ← Back to Products
                </Link>
            </div>
        );
    }

    if (!reservation) {
        return null;
    }

    const isPending = reservation.status === "PENDING";
    const isExpired = reservation.status === "EXPIRED";
    const isConfirmed = reservation.status === "CONFIRMED";
    const isReleased = reservation.status === "RELEASED";
    const totalAmount =
        Number(reservation.product.price) * reservation.quantity;
    const statusSummary = isPending
        ? "Reservation is waiting for final confirmation."
        : isConfirmed
          ? "Reservation was confirmed and stock has been decremented."
          : isReleased
            ? "Reservation was released and stock was returned."
            : "Reservation expired before it was confirmed.";

    return (
        <div className="container py-8">
            <div className="mb-4">
                <div
                    className="table-meta"
                    style={{ marginBottom: "0.5rem" }}>
                    <Link
                        href="/"
                        style={{
                            color: "var(--accent)",
                            textDecoration: "none",
                        }}>
                        Products
                    </Link>
                    <span>/</span>
                    <span>Reservation</span>
                    <span>/</span>
                    <span className="text-mono">
                        {reservation.id.slice(0, 12)}…
                    </span>
                </div>
            </div>

            <section className="hero-shell">
                <div className="hero-panel">
                    <div className="hero-copy">
                        <div className="hero-kicker">
                            <span className="status-dot" />
                            Reservation detail
                        </div>
                        <div className="page-header">
                            <h1 className="page-title">
                                Reservation {reservation.id.slice(0, 8)}
                            </h1>
                            <p className="page-subtitle">{statusSummary}</p>
                        </div>
                        <div className="hero-status">
                            <span className="chip">
                                {reservation.product.name}
                            </span>
                            <span className="chip">
                                {reservation.warehouse.name}
                            </span>
                            <span className="chip">
                                Qty {reservation.quantity}
                            </span>
                            <span className="chip">
                                {formatPrice(String(totalAmount))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hero-aside">
                    <div className="hero-summary">
                        <h2>Status</h2>
                        <p>Created {formatDateTime(reservation.createdAt)}</p>
                        <div
                            className="hero-status"
                            style={{ marginTop: "0.75rem" }}>
                            <StatusBadge status={reservation.status} />
                            <span className="chip">
                                <span
                                    className="chip-dot"
                                    style={{ background: "var(--accent)" }}
                                />
                                {formatDateTime(reservation.expiresAt)}
                            </span>
                        </div>
                    </div>

                    <div className="panel-note">
                        <h3>Countdown</h3>
                        {isPending && !countdown.isExpired ? (
                            <div>
                                <div
                                    className={`countdown ${
                                        countdown.isUrgent
                                            ? "countdown-urgent"
                                            : countdown.isWarning
                                              ? "countdown-normal"
                                              : "countdown-safe"
                                    }`}
                                    style={{
                                        fontSize: "2.4rem",
                                        fontWeight: 700,
                                        marginTop: "0.5rem",
                                    }}>
                                    {countdown.formatted}
                                </div>
                                <p style={{ marginTop: "0.5rem" }}>
                                    {countdown.isUrgent
                                        ? "Less than one minute remains."
                                        : countdown.isWarning
                                          ? "Confirm or release before time runs out."
                                          : "The reservation is still live."}
                                </p>
                            </div>
                        ) : isExpired ? (
                            <p style={{ marginTop: "0.5rem" }}>
                                This reservation has already expired.
                            </p>
                        ) : (
                            <p style={{ marginTop: "0.5rem" }}>
                                {isConfirmed
                                    ? "The order has been confirmed."
                                    : "The order has been released."}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {actionError && (
                <div className="alert alert-error mb-4">
                    <span>⚠</span>
                    <div>
                        <strong>Action Failed:</strong> {actionError}
                        {actionError.includes("expired") && (
                            <div style={{ marginTop: "0.75rem" }}>
                                <Link
                                    href="/"
                                    className="btn btn-primary btn-sm">
                                    Create New Reservation
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {actionSuccess && (
                <div className="alert alert-success mb-4">
                    <span>✓</span>
                    <span>{actionSuccess}</span>
                </div>
            )}

            {isExpired && (
                <div className="alert alert-error mb-4">
                    <span>⏰</span>
                    <div>
                        <strong>Reservation Expired</strong>
                        <p style={{ marginTop: "0.25rem" }}>
                            This reservation expired and stock has been returned
                            to inventory.
                        </p>
                        <div style={{ marginTop: "0.75rem" }}>
                            <Link
                                href="/"
                                className="btn btn-primary btn-sm">
                                Create New Reservation
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="split-layout">
                <div className="detail-grid">
                    <section className="section">
                        <div className="section-header">
                            <div className="section-title">Product</div>
                            <span className="section-note">
                                SKU and pricing details
                            </span>
                        </div>
                        <div className="section-body">
                            <div className="detail-row">
                                <div className="detail-label">Name</div>
                                <div
                                    className="detail-value"
                                    style={{ fontWeight: 700 }}>
                                    {reservation.product.name}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">SKU</div>
                                <div className="detail-value text-mono">
                                    {reservation.product.sku}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Unit price</div>
                                <div className="detail-value">
                                    {formatPrice(reservation.product.price)}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Quantity</div>
                                <div className="detail-value">
                                    {reservation.quantity}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Total</div>
                                <div
                                    className="detail-value"
                                    style={{ fontWeight: 700 }}>
                                    {formatPrice(String(totalAmount))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <div className="section-title">
                                Fulfillment warehouse
                            </div>
                            <span className="section-note">
                                Reservation source of truth
                            </span>
                        </div>
                        <div className="section-body">
                            <div className="detail-row">
                                <div className="detail-label">Warehouse</div>
                                <div className="detail-value">
                                    {reservation.warehouse.name}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Code</div>
                                <div className="detail-value text-mono">
                                    {reservation.warehouse.code}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">City</div>
                                <div className="detail-value">
                                    {reservation.warehouse.city}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <div className="section-title">Timeline</div>
                            <span className="section-note">
                                Lifecycle events for this hold
                            </span>
                        </div>
                        <div className="section-body">
                            <div className="timeline-list">
                                <TimelineItem
                                    label="Reserved"
                                    value={formatDateTime(
                                        reservation.createdAt,
                                    )}
                                    active
                                />
                                <TimelineItem
                                    label={isExpired ? "Expired" : "Expires"}
                                    value={formatDateTime(
                                        reservation.expiresAt,
                                    )}
                                    active={isPending && !countdown.isExpired}
                                    isWarning={isPending && countdown.isWarning}
                                    isDanger={isExpired}
                                />
                                <TimelineItem
                                    label="Confirmed"
                                    value={formatDateTime(
                                        reservation.confirmedAt,
                                    )}
                                    active={isConfirmed}
                                />
                                <TimelineItem
                                    label="Released"
                                    value={formatDateTime(
                                        reservation.releasedAt,
                                    )}
                                    active={isReleased}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <div className="section-title">Reservation ID</div>
                            <span className="section-note">
                                Copy this if you need to trace the hold
                            </span>
                        </div>
                        <div className="section-body">
                            <div
                                className="text-mono"
                                style={{ wordBreak: "break-all" }}>
                                {reservation.id}
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="side-rail">
                    {isPending && !countdown.isExpired && (
                        <section className="section">
                            <div className="section-header">
                                <div className="section-title">Actions</div>
                                <span className="section-note">
                                    Confirm or release
                                </span>
                            </div>
                            <div className="section-body">
                                <div
                                    style={{ display: "grid", gap: "0.75rem" }}>
                                    <button
                                        type="button"
                                        className="btn btn-success w-full btn-lg"
                                        onClick={handleConfirm}
                                        disabled={!!actionLoading}>
                                        {actionLoading === "confirm" ? (
                                            <>
                                                <span className="spinner spinner-sm" />
                                                Confirming…
                                            </>
                                        ) : (
                                            "✓ Confirm Order"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger w-full"
                                        onClick={handleRelease}
                                        disabled={!!actionLoading}>
                                        {actionLoading === "release" ? (
                                            <>
                                                <span className="spinner spinner-sm" />
                                                Releasing…
                                            </>
                                        ) : (
                                            "✕ Cancel Reservation"
                                        )}
                                    </button>
                                </div>
                                <p
                                    className="section-note"
                                    style={{ marginTop: "0.85rem" }}>
                                    Confirming permanently decrements stock.
                                    Releasing returns the stock to the
                                    warehouse.
                                </p>
                            </div>
                        </section>
                    )}

                    {isConfirmed && (
                        <section className="section">
                            <div className="section-header">
                                <div className="section-title">
                                    Order confirmed
                                </div>
                                <span className="section-note">
                                    Stock deducted
                                </span>
                            </div>
                            <div className="section-body">
                                <div
                                    className="alert alert-success"
                                    style={{ marginBottom: "1rem" }}>
                                    <span>✓</span>
                                    <div>
                                        <strong>Stock Deducted</strong>
                                        <p
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "0.8125rem",
                                            }}>
                                            {reservation.quantity} unit(s)
                                            permanently removed from inventory.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/"
                                    className="btn btn-secondary w-full">
                                    ← Back to Products
                                </Link>
                            </div>
                        </section>
                    )}

                    {(isReleased || isExpired) && (
                        <section className="section">
                            <div className="section-header">
                                <div className="section-title">
                                    Reservation ended
                                </div>
                                <span className="section-note">
                                    Stock returned
                                </span>
                            </div>
                            <div className="section-body">
                                <p
                                    className="section-note"
                                    style={{ marginBottom: "1rem" }}>
                                    The reservation is no longer active.
                                </p>
                                <Link
                                    href="/"
                                    className="btn btn-primary w-full">
                                    Reserve Again
                                </Link>
                            </div>
                        </section>
                    )}

                    <section className="section">
                        <div className="section-header">
                            <div className="section-title">Quick facts</div>
                            <span className="section-note">At a glance</span>
                        </div>
                        <div className="section-body">
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">Created</div>
                                    <div className="detail-value">
                                        {formatDateTime(reservation.createdAt)}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Updated</div>
                                    <div className="detail-value">
                                        {formatDateTime(reservation.updatedAt)}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Status</div>
                                    <div className="detail-value">
                                        <StatusBadge
                                            status={reservation.status}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
