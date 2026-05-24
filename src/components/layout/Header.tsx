"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();

    return (
        <header className="nav">
            <div className="nav-inner">
                <div className="nav-brand-wrap">
                    <Link href="/products" className="nav-brand">
                        allo<span>inventory</span>
                    </Link>
                    <span className="nav-subtitle">
                        Multi-warehouse reservation system
                    </span>
                </div>

                <nav className="nav-links">
                    <Link
                        href="/products"
                        className={`nav-link${pathname === "/products" || pathname === "/" ? " active" : ""}`}>
                        Products
                    </Link>
                    <div className="nav-status">
                        <span className="status-dot" />
                        Live
                    </div>
                </nav>
            </div>
        </header>
    );
}
