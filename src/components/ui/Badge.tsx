import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
    return (
        <span className={`badge ${className}`.trim()}>{children}</span>
    );
}

interface StockBadgeProps {
    stock: number;
    reserved: number;
    total: number;
}

export function StockBadge({ stock, reserved, total }: StockBadgeProps) {
    const available = stock - reserved;
    const pct = total > 0 ? (available / total) * 100 : 0;

    const cls =
        available === 0
            ? "stock-zero"
            : pct < 20
              ? "stock-low"
              : pct < 50
                ? "stock-medium"
                : "stock-high";

    return (
        <span className={`stock-pill ${cls}`}>
            {available} / {total}
        </span>
    );
}

interface StatusBadgeProps {
    status: "PENDING" | "CONFIRMED" | "EXPIRED" | "RELEASED";
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const cls = {
        PENDING: "badge badge-pending",
        CONFIRMED: "badge badge-confirmed",
        EXPIRED: "badge badge-expired",
        RELEASED: "badge badge-released",
    }[status];

    const label = {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        EXPIRED: "Expired",
        RELEASED: "Released",
    }[status];

    return <span className={cls}>{label}</span>;
}
