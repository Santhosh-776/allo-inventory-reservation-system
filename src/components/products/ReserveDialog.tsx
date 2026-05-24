"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, Input, ErrorState, Spinner } from "../../components/ui";
import { useCreateReservation } from "../../hooks";

interface ReserveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    maxStock: number;
    onSuccess?: () => void;
}

export function ReserveDialog({
    isOpen,
    onClose,
    productId,
    productName,
    warehouseId,
    warehouseName,
    maxStock,
    onSuccess,
}: ReserveDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const { loading, error, create } = useCreateReservation();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity < 1 || quantity > maxStock) return;

        const reservationId = await create(productId, warehouseId, quantity);
        if (reservationId) {
            onClose();
            onSuccess?.();
            router.push(`/reservations/${reservationId}`);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reserve Stock"
            size="sm">
            <form
                onSubmit={handleSubmit}
                className="space-y-4">
                <div>
                    <p className="text-sm text-slate-600 mb-1">Product</p>
                    <p className="font-medium text-slate-900">{productName}</p>
                </div>

                <div>
                    <p className="text-sm text-slate-600 mb-1">Warehouse</p>
                    <p className="font-medium text-slate-900">
                        {warehouseName}
                    </p>
                </div>

                <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    max={maxStock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    disabled={loading}
                />

                <p className="text-xs text-slate-600">
                    Available: {maxStock} unit{maxStock !== 1 ? "s" : ""}
                </p>

                {error && <ErrorState message={error.message} />}

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            loading || quantity < 1 || quantity > maxStock
                        }>
                        {loading ? <Spinner /> : "Reserve"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
