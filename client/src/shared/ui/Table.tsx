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
  emptyComponent?: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyComponent = <div className="p-8 text-center text-lg">No data available</div>,
  currentPage,
  totalPages,
  onPageChange,
}: TableProps<T>) {
  if (isLoading) {
    return <TableShimmer />;
  }

  if (!data || data.length === 0) {
    return emptyComponent;
  }

  return (
    <div className="overflow-x-scroll" style={{scrollbarWidth:'none'}}>
        
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
          <span></span>
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
  );
}

export default Table;
