'use client'

import React, { useState } from 'react'
import { UserSettings } from '@prisma/client';
import { differenceInDays, startOfMonth } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { toast } from 'sonner';
import StatsCards from './StatsCards';
import CategoriesStats from './CategoriesStats';

function OverView({ userSettings }: { userSettings: UserSettings}) {
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date}>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  return (
    <>
        <div className='flex flex-wrap item-end justify-end gap-6 py-8 px-8'>
              {/* <h2 className='text-3xl font-bold'>Resumo</h2>  */}
              <div className='flex items-center gap-3'>
                <DateRangePicker 
                    initialDateFrom={dateRange.from}
                    initialDateTo={dateRange.to}
                    showCompare={false}
                    onUpdate={(values) => {
                        const { from, to } = values.range;

                        if(!from || !to) return

                        if(differenceInDays(to, from) > MAX_DATE_RANGE_DAYS){
                            toast.error(`O período selecionado é muito grande. O intervalo máximo permitido é ${MAX_DATE_RANGE_DAYS} dias`)
                            return;
                        }

                        setDateRange({ from, to })
                    }}
                />
              </div>
        </div>
        <div className='flex w-full flex-col gap-2 px-4'>
            <StatsCards
                userSettings={userSettings}
                from={dateRange.from}
                to={dateRange.to}
            />
            <CategoriesStats 
                userSettings={userSettings}
                from={dateRange.from}
                to={dateRange.to}
            />
        </div>
    </>
  )
}

export default OverView