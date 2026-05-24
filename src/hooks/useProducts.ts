"use client";

import { useState, useEffect } from "react";
import { ProductWithInventory, PaginationMeta } from "../types";
import * as productsApi from "../services/api/products";

interface UseProductsState {
    data: ProductWithInventory[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: Error | null;
}

export function useProducts(page = 1, limit = 20, search = "") {
    const [state, setState] = useState<UseProductsState>({
        data: [],
        meta: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setState((prev) => ({ ...prev, loading: true, error: null }));
                const response = await productsApi.listProducts(
                    page,
                    limit,
                    search,
                );
                if (mounted) {
                    setState({
                        data: response.data,
                        meta: response.meta,
                        loading: false,
                        error: null,
                    });
                }
            } catch (err) {
                if (mounted) {
                    setState({
                        data: [],
                        meta: null,
                        loading: false,
                        error:
                            err instanceof Error
                                ? err
                                : new Error("Unknown error"),
                    });
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [page, limit, search]);

    return state;
}
