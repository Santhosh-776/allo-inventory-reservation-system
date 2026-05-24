"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalWarehouses: 0,
        activeReservations: 0,
        totalInventory: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // This would typically call an analytics endpoint
            // For now, we'll show a placeholder
            setStats({
                totalProducts: 11,
                totalWarehouses: 4,
                activeReservations: 0,
                totalInventory: 0,
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const StatCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-600 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                </div>
                <span className="text-4xl">{icon}</span>
            </div>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-1">Overview of your pharmaceutical inventory system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Products" value={stats.totalProducts} icon="💊" />
                <StatCard label="Warehouses" value={stats.totalWarehouses} icon="🏭" />
                <StatCard label="Active Reservations" value={stats.activeReservations} icon="🔖" />
                <StatCard label="Total SKUs" value={stats.totalInventory} icon="📦" />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/products"
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center transition-colors"
                    >
                        <div className="text-2xl mb-2">💊</div>
                        <p className="font-medium text-slate-900">Manage Products</p>
                        <p className="text-xs text-slate-600 mt-1">Add, edit, or delete products</p>
                    </a>
                    <a
                        href="/admin/warehouses"
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center transition-colors"
                    >
                        <div className="text-2xl mb-2">🏭</div>
                        <p className="font-medium text-slate-900">Manage Warehouses</p>
                        <p className="text-xs text-slate-600 mt-1">Add or update warehouse locations</p>
                    </a>
                    <a
                        href="/admin/inventory"
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center transition-colors"
                    >
                        <div className="text-2xl mb-2">📦</div>
                        <p className="font-medium text-slate-900">Inventory</p>
                        <p className="text-xs text-slate-600 mt-1">Track stock levels</p>
                    </a>
                    <a
                        href="/admin/reservations"
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center transition-colors"
                    >
                        <div className="text-2xl mb-2">🔖</div>
                        <p className="font-medium text-slate-900">Reservations</p>
                        <p className="text-xs text-slate-600 mt-1">View all reservations</p>
                    </a>
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 System Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Database: PostgreSQL (Prisma)</li>
                    <li>✅ Real-time stock tracking across 4 warehouses</li>
                    <li>✅ Automatic reservation expiry handling</li>
                    <li>✅ Idempotency support for API calls</li>
                </ul>
            </div>
        </div>
    );
}
