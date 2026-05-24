export function Spinner() {
    return (
        <span
            style={{
                display: "inline-block",
                width: "1rem",
                height: "1rem",
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
            }}
        />
    );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 0",
                gap: "0.75rem",
                color: "var(--text-muted)",
            }}>
            <Spinner />
            <p style={{ fontSize: "0.875rem" }}>{message}</p>
        </div>
    );
}

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="alert alert-error" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <p style={{ fontWeight: 600 }}>Error</p>
            <p>{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        textDecoration: "underline",
                        color: "inherit",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}>
                    Try again
                </button>
            )}
        </div>
    );
}

export function EmptyState({
    message = "No data found",
}: {
    message?: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 0",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
            }}>
            {message}
        </div>
    );
}
