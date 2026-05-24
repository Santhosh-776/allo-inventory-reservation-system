import { ReactNode } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="app-shell">
            <Header />
            <main className="app-main">
                <div className="container">{children}</div>
            </main>
        </div>
    );
}
