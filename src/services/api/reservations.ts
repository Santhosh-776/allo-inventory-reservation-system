import { ReservationWithDetails } from "../../types";

export interface CreateReservationRequest {
    productId: string;
    warehouseId: string;
    quantity: number;
}

export interface CreateReservationResponse {
    success: boolean;
    data: ReservationWithDetails;
    message: string;
}

export interface ReservationResponse {
    success: boolean;
    data: ReservationWithDetails;
    message: string;
}

class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function apiFetch(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new ApiError(
            res.status,
            json.message || "An error occurred",
            json.error?.code,
        );
    }
    return json;
}

export async function createReservation(
    payload: CreateReservationRequest,
): Promise<CreateReservationResponse> {
    return apiFetch("/api/v1/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function getReservationById(
    id: string,
): Promise<ReservationResponse> {
    return apiFetch(`/api/v1/reservations/${id}`);
}

export async function confirmReservation(
    id: string,
): Promise<ReservationResponse> {
    return apiFetch(`/api/v1/reservations/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

export async function releaseReservation(
    id: string,
): Promise<ReservationResponse> {
    return apiFetch(`/api/v1/reservations/${id}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

export { ApiError };

