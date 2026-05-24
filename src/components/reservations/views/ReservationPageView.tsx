"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState, ErrorState } from "../../../components/ui";
import { useReservation } from "../../../hooks";
import { ReservationCheckout } from "../ReservationCheckout";

export function ReservationPageView() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data, loading, error, fetch } = useReservation();

    useEffect(() => {
        if (id) {
            fetch(id);
        }
    }, [id, fetch]);

    if (loading) {
        return <LoadingState message="Loading reservation..." />;
    }

    if (error) {
        return (
            <div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => router.push("/products")}
                    style={{ marginBottom: "1.5rem" }}>
                    ← Back to Products
                </button>
                <ErrorState
                    message={error.message}
                    onRetry={() => fetch(id)}
                />
            </div>
        );
    }

    if (!data) {
        return (
            <div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => router.push("/products")}
                    style={{ marginBottom: "1.5rem" }}>
                    ← Back to Products
                </button>
                <ErrorState
                    message="Reservation not found"
                    onRetry={() => router.push("/products")}
                />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => router.push("/products")}
                    style={{ marginBottom: "0.75rem" }}>
                    ← Back to Products
                </button>
                <h1 className="page-title">Checkout</h1>
                <p className="page-subtitle">
                    Review your reservation and confirm to complete the purchase
                </p>
            </div>

            <ReservationCheckout
                reservation={data}
                onStatusChange={() => fetch(id)}
            />
        </div>
    );
}
