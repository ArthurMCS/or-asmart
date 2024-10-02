'use client'

import React, { ReactNode, useCallback, useMemo } from 'react'
import { UserSettings } from '@prisma/client';
import { GetBalanceStatsResponseType } from '../../api/stats/balance/route';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUP from "react-countup"

interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings
}

function StatsCards({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ['overview', 'stats', from, to],
    queryFn: () => fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json()),
  })

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency) 
  }, [userSettings.currency])

  const income = statsQuery.data?.income || 0
  const expense = statsQuery.data?.expense || 0

  const balance = income - expense 
  return (
    <div className='relative flex w-full flex-wrap gap-2 md:flex-nowrap'>
        <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <StatCard 
                formatter={formatter}
                value={income}
                title="Ganhos"
                icon={<TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />}
            />
        </SkeletonWrapper>

        <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <StatCard 
                formatter={formatter}
                value={expense}
                title="Gastos"
                icon={<TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />}
            />
        </SkeletonWrapper>

        <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <StatCard 
                formatter={formatter}
                value={balance}
                title="Saldo"
                icon={<Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />}
            />
        </SkeletonWrapper>
    </div>
  )
}

export default StatsCards

function StatCard({ formatter, icon, title, value }: { formatter: Intl.NumberFormat, icon: ReactNode, title: string, value: number}){
    const formatFn = useCallback((value: number) => {
      return formatter.format(value)
    }, [formatter])

    return (
      <Card className='flex h-24 w-full items-center gap-2 p-4'>
        {icon}
        <div className='flex flex-col items-start gap-0'>
            <p className='text-muted-foreground'>{title}</p>
            <CountUP 
              preserveValue
              redraw={false}
              end={value}
              decimals={2}
              formattingFn={formatFn}
              className="text-2xl"
            />
        </div>
      </Card>
    )
}