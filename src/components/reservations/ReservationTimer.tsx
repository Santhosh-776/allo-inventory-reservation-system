"use client";

import { useReservationTimer } from "../../hooks";

interface ReservationTimerProps {
    expiresAt: string;
}

export function ReservationTimer({ expiresAt }: ReservationTimerProps) {
    const { minutes, seconds, expired } = useReservationTimer(expiresAt);

    if (expired) {
        return (
            <div className="alert alert-error">
                <span>⏱</span>
                <div>
                    <p style={{ fontWeight: 600 }}>Reservation Expired</p>
                    <p>This reservation is no longer valid. Please create a new one.</p>
                </div>
            </div>
        );
    }

    const isUrgent = minutes < 2;
    const countdownClass = isUrgent ? "countdown-urgent" : minutes < 5 ? "countdown-normal" : "countdown-safe";
    const alertClass = isUrgent ? "alert-error" : "alert-warning";

    return (
        <div className={`alert ${alertClass}`}>
            <span>⏱</span>
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                    Time Remaining to Confirm
                </p>
                <p
                    className={`countdown ${countdownClass}`}
                    style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                </p>
                <p style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    Confirm your reservation before it expires and stock is
                    released
                </p>
            </div>
        </div>
    );
}
