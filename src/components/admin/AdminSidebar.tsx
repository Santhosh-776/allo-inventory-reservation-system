"use client";

import Link from "next/link";
import { useState } from "react";

export function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside className={`${isOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 min-h-screen`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                {isOpen && <h2 className="text-lg font-bold">Admin</h2>}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-slate-800 rounded"
                >
                    {isOpen ? "←" : "→"}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                <AdminNavLink href="/admin/dashboard" label="Dashboard" icon="📊" isOpen={isOpen} />
                <AdminNavLink href="/admin/products" label="Products" icon="💊" isOpen={isOpen} />
                <AdminNavLink href="/admin/warehouses" label="Warehouses" icon="🏭" isOpen={isOpen} />
                <AdminNavLink href="/admin/inventory" label="Inventory" icon="📦" isOpen={isOpen} />
                <AdminNavLink href="/admin/reservations" label="Reservations" icon="🔖" isOpen={isOpen} />
                <div className="pt-4 border-t border-slate-700">
                    <AdminNavLink href="/" label="Back to Store" icon="🏪" isOpen={isOpen} />
                </div>
            </nav>
        </aside>
    );
}

function AdminNavLink({
    href,
    label,
    icon,
    isOpen,
}: {
    href: string;
    label: string;
    icon: string;
    isOpen: boolean;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 transition-colors"
        >
            <span className="text-xl">{icon}</span>
            {isOpen && <span className="text-sm">{label}</span>}
        </Link>
    );
}
