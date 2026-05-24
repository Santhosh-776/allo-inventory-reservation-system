import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...rest
}: ButtonProps) {
    const variantClass = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        danger: "btn-danger",
        success: "btn-success",
    }[variant];

    const sizeClass = {
        sm: "btn-sm",
        md: "",
        lg: "btn-lg",
    }[size];

    return (
        <button
            className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
            {...rest}>
            {children}
        </button>
    );
}
