"use client";

import { create } from "zustand";
import { Product } from "../lib/api-client";

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    search: string;
    category: string;
    setProducts: (products: Product[], totalPages: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    setCategory: (category: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    error: null,
    page: 1,
    totalPages: 1,
    search: "",
    category: "",
    setProducts: (products, totalPages) => set({ products, totalPages }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPage: (page) => set({ page }),
    setSearch: (search) => set({ search, page: 1 }),
    setCategory: (category) => set({ category, page: 1 }),
}));
