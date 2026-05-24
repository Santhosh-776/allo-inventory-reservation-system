"use client";

import { useState, useEffect } from "react";

export function useReservationTimer(expiresAt: string) {
    const [timeLeft, setTimeLeft] = useState<{
        minutes: number;
        seconds: number;
        expired: boolean;
    }>({
        minutes: 0,
        seconds: 0,
        expired: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const expiry = new Date(expiresAt);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ minutes: 0, seconds: 0, expired: true });
                clearInterval(interval);
            } else {
                const minutes = Math.floor(diff / 1000 / 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimeLeft({ minutes, seconds, expired: false });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return timeLeft;
}
