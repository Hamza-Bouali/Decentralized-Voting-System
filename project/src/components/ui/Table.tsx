import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  responsive?: boolean;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const Table: React.FC<TableProps> = ({
  children,
  className,
  striped = false,
  bordered = false,
  hoverable = true,
  compact = false,
  responsive = true,
}) => {
  const table = (
    <table
      className={twMerge(
        'w-full text-sm text-left text-gray-700',
        bordered && 'border border-gray-200',
        className
      )}
    >
      {children}
    </table>
  );

  if (responsive) {
    return (
      <div className="overflow-x-auto rounded-md shadow-sm">
        {table}
      </div>
    );
  }

  return table;
};

export const TableHead: React.FC<TableHeadProps> = ({ 
  children,
  className
}) => {
  return (
    <thead className={twMerge('text-xs text-gray-600 uppercase bg-gray-100', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
  loading = false,
  loadingText = 'Loading data...',
  emptyText = 'No data available',
  isEmpty = false,
}) => {
  if (loading) {
    return (
      <tbody className={className}>
        <tr>
          <td colSpan={100} className="px-6 py-4 text-center text-gray-500">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {loadingText}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (isEmpty) {
    return (
      <tbody className={className}>
        <tr>
          <td colSpan={100} className="px-6 py-4 text-center text-gray-500">
            {emptyText}
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody className={className}>{children}</tbody>;
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  active = false,
}) => {
  return (
    <tr
      className={twMerge(
        'border-b',
        'hover:bg-gray-50',
        active && 'bg-blue-50 hover:bg-blue-50',
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left',
}) => {
  return (
    <td
      className={twMerge(
        'px-6 py-4',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  );
};

export const TableHeaderCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left',
}) => {
  return (
    <th
      scope="col"
      className={twMerge(
        'px-6 py-3',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </th>
  );
};

export default Table;
