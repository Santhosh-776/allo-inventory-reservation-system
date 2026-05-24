import { ReactNode, useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg";
}

const MAX_WIDTH = { sm: "28rem", md: "36rem", lg: "56rem" };

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}>
            <div
                style={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "1.25rem",
                    boxShadow: "0 8px 40px rgba(31,26,23,0.18)",
                    width: "100%",
                    maxWidth: MAX_WIDTH[size],
                    margin: "1rem",
                }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--border)",
                    }}>
                    <h2
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                        }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.25rem",
                            color: "var(--text-muted)",
                            lineHeight: 1,
                        }}>
                        ×
                    </button>
                </div>
                <div style={{ padding: "1.25rem" }}>{children}</div>
            </div>
        </div>
    );
}
