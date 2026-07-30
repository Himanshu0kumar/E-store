"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination control.
 *
 * Props:
 *  - currentPage: number (1-indexed)
 *  - totalPages: number
 *  - onPageChange: (page: number) => void
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // Build a compact page list: always show first, last, current,
  // and one neighbor on each side; collapse the rest into "…".
  const getPageList = () => {
    const pages = [];
    const addPage = (p) => pages.push(p);
    const addEllipsis = () => pages.push("ellipsis");

    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);

    addPage(1);
    if (windowStart > 2) addEllipsis();

    for (let p = windowStart; p <= windowEnd; p++) addPage(p);

    if (windowEnd < totalPages - 1) addEllipsis();
    if (totalPages > 1) addPage(totalPages);

    return pages;
  };

  const pageList = getPageList();

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5"
    >
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageList.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              item === currentPage
                ? "bg-emerald-600 text-white"
                : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}