import { ReactNode } from "react";

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = "" }: TableProps) {
    return (
        <div
            className={`overflow-x-auto border border-slate-200 rounded ${className}`}>
            <table className="w-full text-sm">{children}</table>
        </div>
    );
}

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
    return (
        <thead className={`bg-slate-50 border-b border-slate-200 ${className}`}>
            {children}
        </thead>
    );
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
    return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
}

export function TableRow({ children, className = "" }: TableRowProps) {
    return (
        <tr
            className={`border-b border-slate-200 hover:bg-slate-50 ${className}`}>
            {children}
        </tr>
    );
}

interface TableHeaderCellProps {
    children: ReactNode;
    className?: string;
}

export function TableHeaderCell({
    children,
    className = "",
}: TableHeaderCellProps) {
    return (
        <th
            className={`px-4 py-3 text-left font-semibold text-slate-700 bg-slate-50 ${className}`}>
            {children}
        </th>
    );
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
    return (
        <td className={`px-4 py-3 text-slate-900 ${className}`}>{children}</td>
    );
}
