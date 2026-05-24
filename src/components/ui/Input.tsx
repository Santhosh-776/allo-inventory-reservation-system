import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {label && (
                <label
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                    }}>
                    {label}
                </label>
            )}
            <input
                className={`input ${error ? "border-red-400" : ""} ${className}`.trim()}
                {...props}
            />
            {error && (
                <span style={{ fontSize: "0.8rem", color: "var(--danger)" }}>
                    {error}
                </span>
            )}
        </div>
    );
}
