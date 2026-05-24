"use client";

interface ProductFiltersProps {
    onSearch: (search: string) => void;
    onRefresh: () => void;
}

export function ProductFilters({ onSearch, onRefresh }: ProductFiltersProps) {
    return (
        <div className="control-bar">
            <div className="control-group" style={{ flex: 1 }}>
                <input
                    type="text"
                    placeholder="Search by product name or SKU…"
                    onChange={(e) => onSearch(e.target.value)}
                    className="input search-field"
                />
            </div>
            <div className="control-group">
                <button
                    onClick={onRefresh}
                    className="btn btn-secondary btn-sm">
                    ↻ Refresh
                </button>
            </div>
        </div>
    );
}
