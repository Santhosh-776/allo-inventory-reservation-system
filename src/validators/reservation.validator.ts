import { z } from "zod";

export const CreateReservationSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  warehouseId: z.string().min(1, "warehouseId is required"),
  quantity: z
    .number({ error: "quantity is required" })
    .int("quantity must be an integer")
    .min(1, "quantity must be at least 1")
    .max(100, "quantity cannot exceed 100 per reservation"),
});

export const ConfirmReservationSchema = z.object({
});

export const ReleaseReservationSchema = z.object({
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type ConfirmReservationInput = z.infer<typeof ConfirmReservationSchema>;
export type ReleaseReservationInput = z.infer<typeof ReleaseReservationSchema>;
