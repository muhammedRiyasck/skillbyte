import React from "react";
import TableShimmer from "@shared/shimmer/Table";
import Pagination from "./Pagination";

export interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isFetching?: boolean;
  emptyComponent?: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function Table<T>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  emptyComponent = <div className="p-8 text-center text-lg">No data available</div>,
  currentPage,
  totalPages,
  onPageChange,
}: TableProps<T>) {

  if (isLoading && (!data || data.length === 0)) {
    return <TableShimmer />;
  }

  const showEmptyState = !isLoading && (!data || data.length === 0);
  if (showEmptyState) {
    return emptyComponent;
  }

  return (
    <div className="overflow-x-scroll" style={{scrollbarWidth:'none'}}>
      {/* Subtle top loading bar shown during refetch/search */}
      <div className="relative h-0.5 w-full bg-transparent">
        {isFetching && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{
                animation: 'tableProgressBar 1.2s ease-in-out infinite',
                width: '40%',
              }}
            />
          </div>
        )}
      </div>
      <div className={isFetching ? 'opacity-60 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
      <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {columns.map((col, colIndex) => {
                let cellContent: React.ReactNode;
                if (typeof col.accessor === 'function') {
                  cellContent = col.accessor(row);
                } else {
                  cellContent = row[col.accessor] as React.ReactNode;
                }
                return (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-lg text-gray-900 dark:text-white ${col.className ?? ''}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages && currentPage && onPageChange && totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
      </div>
    </div>
  );
}

export default Table;
