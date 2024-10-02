"use client"
import { GetCategoryStatsResponseType } from '@/app/api/stats/categories/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { TransactionType } from '@/lib/types';
import { UserSettings } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react'

interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings
}

function CategoriesStats({ from, to, userSettings }: Props) {
    const statsQuery = useQuery<GetCategoryStatsResponseType>({
        queryKey: ['overview', 'stats', 'categories', from, to],
        queryFn: () => fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json()),
      })
    
      const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency) 
      }, [userSettings.currency]) 
      
      
  return (
    <div className='flex w-full flex-wrap gap-2 md:flex-nowrap'>
        <SkeletonWrapper isLoading={statsQuery.isPending}>
                <CategoriesCard 
                    formatter={formatter}
                    type="income"
                    data={statsQuery.data || []}
                />
        </SkeletonWrapper>
        <SkeletonWrapper isLoading={statsQuery.isPending}>
                <CategoriesCard 
                    formatter={formatter}
                    type="expense"
                    data={statsQuery.data || []}
                />
        </SkeletonWrapper>
    </div>
  )
}

export default CategoriesStats

function CategoriesCard({ data, type, formatter }: {
    type: TransactionType,
    formatter: Intl.NumberFormat,
    data: GetCategoryStatsResponseType
}){
    const filteredData = data.filter(el => el.type === type)
    const total = filteredData.reduce((acc, el) => acc + (el.totalAmount || 0), 0)

    return (
        <Card className='h-80 w-full cil-span-6'>
            <CardHeader>
                <CardTitle className='grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col'>
                    {type === 'income' ? 'Ganhos por categoria' : 'Gastos por categoria'}
                </CardTitle>
            </CardHeader>

            <div className='flex items-center justify-between gap-2'>
                {filteredData.length === 0 && (
                    <div className='flex h-60 w-full flex-col items-center justify-center'>
                        Não há dados para o período selecionado
                        <p className='text-sm text-muted-foreground'>
                            Tente selecionar um período diferente ou tente adicionar novos {type === 'income' ? 'ganhos' : ' gastos'}
                        </p>
                    </div>
                )}

                {filteredData.length > 0 && (
                    <ScrollArea className='h-60 w-full px-4'>
                        <div className='flex w-full flex-col gap-4 p-4'>
                            {filteredData.map((item => {
                                const amount = item.totalAmount || 0;
                                const percentage = (amount * 100) / (total || amount)

                                return (
                                    <div key={item.categoryId} className='flex flex-col gap-2'>
                                        <div className='flex items-center text-gray-400'>
                                            <span className='flex items-center text-gray-400'>
                                                {item.category.icon} {item.category.name}
                                                <span className='ml-2 mr-2 text-xs text-muted-foreground'>
                                                    ({percentage.toFixed(0)}%)
                                                </span>
                                            </span>
                                            <span className='text-sm text-gray-400'>
                                                {formatter.format(amount)}
                                            </span>

                                        </div>
                                            <Progress
                                                value={percentage}
                                                indicator={type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}
                                            />
                                    </div>
                                )
                            }))}
                        </div>
                    </ScrollArea>
                )}
            </div>  
        </Card>
    )
}