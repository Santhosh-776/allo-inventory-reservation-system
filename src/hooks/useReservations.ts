"use client";

import { useState } from "react";
import { ReservationWithDetails } from "../types";
import * as reservationsApi from "../services/api/reservations";

// ─── Get Reservation ─────────────────────────────────────────────────────────

interface UseReservationState {
    data: ReservationWithDetails | null;
    loading: boolean;
    error: Error | null;
}

export function useReservation(id?: string) {
    const [state, setState] = useState<UseReservationState>({
        data: null,
        loading: !!id,
        error: null,
    });

    const fetch = async (reservationId: string) => {
        try {
            setState({ data: null, loading: true, error: null });
            const response =
                await reservationsApi.getReservationById(reservationId);
            setState({ data: response.data, loading: false, error: null });
        } catch (err) {
            setState({
                data: null,
                loading: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
            });
        }
    };

    return { ...state, fetch };
}

// ─── Create Reservation ───────────────────────────────────────────────────────

interface UseCreateReservationState {
    loading: boolean;
    error: Error | null;
    reservationId: string | null;
}

export function useCreateReservation() {
    const [state, setState] = useState<UseCreateReservationState>({
        loading: false,
        error: null,
        reservationId: null,
    });

    const create = async (
        productId: string,
        warehouseId: string,
        quantity: number,
    ): Promise<string | null> => {
        try {
            setState({ loading: true, error: null, reservationId: null });
            const response = await reservationsApi.createReservation({
                productId,
                warehouseId,
                quantity,
            });
            const id = response.data.id;
            setState({ loading: false, error: null, reservationId: id });
            return id;
        } catch (err) {
            setState({
                loading: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
                reservationId: null,
            });
            return null;
        }
    };

    return { ...state, create };
}

// ─── Confirm / Release ────────────────────────────────────────────────────────

interface UseActionState {
    loading: boolean;
    error: Error | null;
    success: boolean;
}

export function useConfirmReservation() {
    const [state, setState] = useState<UseActionState>({
        loading: false,
        error: null,
        success: false,
    });

    const confirm = async (id: string) => {
        try {
            setState({ loading: true, error: null, success: false });
            await reservationsApi.confirmReservation(id);
            setState({ loading: false, error: null, success: true });
        } catch (err) {
            setState({
                loading: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
                success: false,
            });
        }
    };

    return { ...state, confirm };
}

export function useReleaseReservation() {
    const [state, setState] = useState<UseActionState>({
        loading: false,
        error: null,
        success: false,
    });

    const release = async (id: string) => {
        try {
            setState({ loading: true, error: null, success: false });
            await reservationsApi.releaseReservation(id);
            setState({ loading: false, error: null, success: true });
        } catch (err) {
            setState({
                loading: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
                success: false,
            });
        }
    };

    return { ...state, release };
}
