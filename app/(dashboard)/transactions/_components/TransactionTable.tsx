/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateToUTCDate } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
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
import { DataTableFacetedFilter } from '@/components/datatable/FacetedFilters';
import { Transaction } from '@prisma/client';
import { DataTableViewOptions } from '@/components/datatable/ColumnsToggle';
import { Button } from '@/components/ui/button';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { DownloadIcon, MoreHorizontal, TrashIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import DeleteTranactionDialog from './DeleteTranactionDialog';

interface Props {
    from: Date;
    to: Date;
}

const emptyData: any[] = [];

type TransactionHistoryRow = GettRansactionHistoryResponseType[0];

const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: 'category',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Categoria" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
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
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
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
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            return (<RowActions transaction={row.original}/>)
        },
    }
];

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
})

function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const history = useQuery({
        queryKey: ['transactions', 'history', from, to],
        queryFn: () =>
            fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
                .then(res => res.json()),
    });


    const handleExportCSV = (data: any[]) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv)
    }

    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            pagination: {
                pageSize: 10
            }
        },
        state: {
            sorting,
            columnFilters
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const categoriesOptions = useMemo(() => {
        const categoriesMap = new Map()

        history.data?.forEach((transaction: Transaction) => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.categoryIcon} ${transaction.category}`
            })
        })

        const uniqueCategories = new Set(categoriesMap.values())
        return Array.from(uniqueCategories)
    }, [history.data])

    return (
        <div className='w-full px-6 py-6'>
            <div className='flex flex-wrap items-end justify-between gap-2 py-4'>
                <div className='flex gap-2'>
                    {table.getColumn('category') && (
                        <DataTableFacetedFilter 
                            title='Categoria'
                            column={table.getColumn('category')}
                            options={categoriesOptions}
                        />
                    )}
                    {table.getColumn('category') && (
                        <DataTableFacetedFilter 
                            title='Tipo'
                            column={table.getColumn('type')}
                            options={[
                                {label: 'Ganho', value: 'income'},
                                {label: 'Gasto', value: 'expense'}
                            ]}
                        />
                    )}
                </div>
                <div className='flex flex-wrap gap-2'>
                    <Button
                        variant="outline"
                        size="sm"
                        className='ml-outo h-8 lg:flex'
                        onClick={() => {
                            const data = table.getFilteredRowModel().rows.map((row) => ({
                                categoria: row.original.category,
                                icone: row.original.categoryIcon,
                                descrição: row.original.description,
                                tipo: row.original.type === 'income' ? 'ganho' : 'gasto',
                                valor: row.original.formattedAmount,
                                data: row.original.date
                            }))
                            handleExportCSV(data)
                        }}
                    >
                        <DownloadIcon className='mr-2 h-4 w-4'/>
                        Exportar CSV
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
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
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                    Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                    Próxima
                    </Button>
                </div>
            </SkeletonWrapper>
        </div>
    );
}

export default TransactionTable;


function RowActions({ transaction }: { transaction:TransactionHistoryRow }){
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DeleteTranactionDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} transactionId={transaction.id} />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button variant="ghost" className='h-8 w-8 p-0'>
                        <span className='sr-only'>Menu</span>
                        <MoreHorizontal className='h-4 w-4'/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='flex items-center gap-2' onSelect={() => {setShowDeleteDialog(prev => !prev)}}>
                        <TrashIcon className='h-4 w-4 text-muted-foreground'/>
                            Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}