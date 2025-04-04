'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Edit, Eye, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface DataTableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string; sortable?: boolean }[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onOrderHistory?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onOrderHistory
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>({
    key: 'id' as keyof T,
    direction: 'desc'
  });
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  // Global case-insensitive search
  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sorting) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valueA = a[sorting.key];
      const valueB = b[sorting.key];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sorting.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return sorting.direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [filteredData, sorting]);

  // Pagination logic
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={String(column.key)} className="cursor-pointer">
                  <div
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (!column.sortable) return;
                      setSorting(prev =>
                        prev?.key === column.key
                          ? {
                              key: column.key,
                              direction:
                                prev.direction === 'asc' ? 'desc' : 'asc'
                            }
                          : { key: column.key, direction: 'asc' }
                      );
                    }}
                  >
                    {column.label}
                    {column.sortable && <ArrowUpDown size={16} />}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(column => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key])}
                    </TableCell>
                  ))}
                  <TableCell className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(row)}
                        className="hover:cursor-pointer"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(row)}
                        className="hover:cursor-pointer"
                      >
                        <Eye size={16} />
                      </Button>
                    )}
                    {onOrderHistory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOrderHistory(row)}
                        className="hover:cursor-pointer"
                      >
                        Order History
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(row)}
                        className="hover:cursor-pointer"
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {Math.ceil(sortedData.length / rowsPerPage)}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage(p =>
                p + 1 < Math.ceil(sortedData.length / rowsPerPage) ? p + 1 : p
              )
            }
            disabled={(page + 1) * rowsPerPage >= sortedData.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
