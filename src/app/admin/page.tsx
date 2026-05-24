"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";

interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalInventory: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalWarehouses: 0,
    totalInventory: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, warehousesRes, inventoryRes] = await Promise.all([
          fetch("/api/v1/products"),
          fetch("/api/v1/warehouses"),
          fetch("/api/v1/inventory"),
        ]);

        const productsData = await productsRes.json();
        const warehousesData = await warehousesRes.json();
        const inventoryData = await inventoryRes.json();

        setStats({
          totalProducts: productsData.data?.length || 0,
          totalWarehouses: warehousesData.data?.length || 0,
          totalInventory: inventoryData.data?.length || 0,
          lowStockProducts: productsData.data?.filter(
            (p: any) =>
              p.inventories.reduce(
                (sum: number, inv: any) => sum + inv.totalStock,
                0
              ) < 50
          ).length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your inventory system
              </p>
            </div>
            <Link href="/products">
              <Button variant="secondary">← Back to Products</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-medium">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.totalProducts}
            </p>
            <p className="text-xs text-slate-500 mt-2">Active products</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm font-medium">Warehouses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.totalWarehouses}
            </p>
            <p className="text-xs text-slate-500 mt-2">Distribution centers</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm font-medium">
              Inventory Records
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.totalInventory}
            </p>
            <p className="text-xs text-slate-500 mt-2">Stock entries</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-slate-600 text-sm font-medium">Low Stock</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.lowStockProducts}
            </p>
            <p className="text-xs text-slate-500 mt-2">Needs reorder</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Products</h2>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Manage product catalog, pricing, and information
            </p>
            <Link href="/admin/products">
              <Button className="w-full">Manage Products</Button>
            </Link>
          </div>

          {/* Warehouses Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Warehouses
              </h2>
              <span className="text-2xl">🏭</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Manage warehouse locations and details
            </p>
            <Link href="/admin/warehouses">
              <Button className="w-full">Manage Warehouses</Button>
            </Link>
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Inventory</h2>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Manage stock levels and inventory tracking
            </p>
            <Link href="/admin/inventory">
              <Button className="w-full">Manage Inventory</Button>
            </Link>
          </div>

          {/* Reservations Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Reservations
              </h2>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Track and manage product reservations
            </p>
            <Link href="/products">
              <Button className="w-full" variant="secondary">
                View Reservations
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
