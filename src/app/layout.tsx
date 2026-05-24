import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "../components/layout/MainLayout";

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
        <html lang="en">
            <body>
                <MainLayout>{children}</MainLayout>
            </body>
        </html>
    );
}
