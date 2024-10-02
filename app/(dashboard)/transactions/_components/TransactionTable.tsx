/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateToUTCDate } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { GettRansactionHistoryResponseType } from '../../../api/transactions-history/route';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/datatable/ColumnsHeader';
import { cn } from '@/lib/utils';

interface Props {
    from: Date;
    to: Date;
}

const emptyData: any[] = [];

type TransactionHistoryRow = GettRansactionHistoryResponseType[0];

export const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: 'category',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Categoria" />
        ),
        cell: ({ row }) => (
            <div className='flex gap-2 capitalize'>
                {row.original.categoryIcon}
                <div className='capitalize'>
                    {row.original.category}
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Descrição" />
        ),
        cell: ({ row }) => (
            <div className='capitalize'>
                {row.original.description}
            </div>
        ),
    },
    {
        accessorKey: 'date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Data" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.date)
            const formattedDate = date.toLocaleDateString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            })
            return (
                <div className='text-muted-foreground'>
                    {formattedDate}
                </div>
            )
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tipo" />
        ),
        cell: ({ row }) => {
            return (
                <div className={cn(
                    "capitalize rounded-lg text-center p-2",
                    row.original.type === "income" && "bg-emerald-400/10 text-emerald-500",
                    row.original.type === "expense" && "bg-red-400/10 text-red-500"
                )}>
                    {row.original.type === 'income' ? 'ganho' : 'gasto'}
                </div>
            )
        },
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Valor" />
        ),
        cell: ({ row }) => {
            return (
                <p className='text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium'>
                    {row.original.formattedAmount}
                </p>
            )
        },
    },
];

function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const history = useQuery({
        queryKey: ['transactions', 'history', from, to],
        queryFn: () =>
            fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
                .then(res => res.json()),
       /*  onError: (error) => {
            console.error("Failed to fetch transaction history:", error);
        } */
    });


    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='w-full px-6 py-6'>
            <div className='flex flex-wrap items-end justify-between gap-2 py-4'>
                TODO: Filters
            </div>
            <SkeletonWrapper isLoading={history.isFetching}>
                <div className='rounded-md border w-full'>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </SkeletonWrapper>
        </div>
    );
}

export default TransactionTable;
