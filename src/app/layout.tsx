import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Allo Inventory",
        template: "%s | Allo Inventory",
    },
    description:
        "A multi-warehouse inventory reservation system for live stock checks, reservations, confirmations, and releases.",
    keywords: [
        "inventory",
        "warehouse",
        "reservation",
        "stock management",
        "supply chain",
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${spaceGrotesk.variable}`}>
            <body className="app-body">
                <div className="app-shell">
                    <header className="nav">
                        <div className="nav-inner">
                            <div className="nav-brand-wrap">
                                <Link
                                    href="/"
                                    className="nav-brand">
                                    Allo<span>Inventory</span>
                                </Link>
                                <span className="nav-subtitle">
                                    Live multi-warehouse control
                                </span>
                            </div>
                            <div className="nav-links">
                                <Link
                                    href="/"
                                    className="nav-link">
                                    Products
                                </Link>
                                <span className="nav-status">
                                    <span className="status-dot" />
                                    Syncing live stock
                                </span>
                            </div>
                        </div>
                    </header>
                    <main className="app-main">{children}</main>
                </div>
            </body>
        </html>
    );
}
