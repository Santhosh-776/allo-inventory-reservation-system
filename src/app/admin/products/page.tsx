"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui";

interface Product {
    id: string;
    name: string;
    sku: string;
    description?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    isActive: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/v1/products");
            const data = await response.json();
            setProducts(data.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/v1/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price.toString()),
                }),
            });

            if (response.ok) {
                setFormData({ name: "", sku: "", description: "", price: 0, category: "", imageUrl: "" });
                setIsAddingNew(false);
                fetchProducts();
            }
        } catch (error) {
            console.error("Failed to add product:", error);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Product Management</h1>
                    <p className="text-slate-600 mt-1">Manage all pharmaceutical products in inventory</p>
                </div>
                <Button onClick={() => setIsAddingNew(!isAddingNew)} variant="primary">
                    {isAddingNew ? "Cancel" : "+ Add Product"}
                </Button>
            </div>

            {/* Add Product Form */}
            {isAddingNew && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="SKU"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="px-4 py-2 border border-slate-300 rounded"
                            step="0.01"
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded md:col-span-2"
                            rows={2}
                        />
                        <input
                            type="url"
                            placeholder="Image URL"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded md:col-span-2"
                        />
                        <div className="md:col-span-2">
                            <Button type="submit" variant="primary" className="w-full">
                                Add Product
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-600">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">No products found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">SKU</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-sm text-slate-900 font-medium">{product.name}</td>
                                        <td className="px-6 py-3 text-sm text-slate-600">{product.sku}</td>
                                        <td className="px-6 py-3 text-sm text-slate-600">{product.category}</td>
                                        <td className="px-6 py-3 text-sm text-slate-900 font-medium">₹{product.price}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    product.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
