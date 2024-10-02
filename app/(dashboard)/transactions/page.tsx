"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { differenceInDays, endOfMonth, startOfMonth } from 'date-fns';
import React, { useState } from 'react';
import { toast } from 'sonner';
import TransactionTable from './_components/TransactionTable';

function TransactionPage() {
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <>
      <div className='border-b bg-card'>
        <div className='flex flex-wrap items-center justify-between gap-4 sm:gap-6 py-6 px-4 sm:px-8'>
          <div>
            <p className='text-xl sm:text-2xl lg:text-3xl font-bold'>Histórico de movimentações</p>
          </div>
          <div className='w-full sm:w-auto'>
            <DateRangePicker
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              showCompare={false}
              onUpdate={(values) => {
                const { from, to } = values.range;

                if (!from || !to) return;

                if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                  toast.error(
                    `O período selecionado é muito grande. O intervalo máximo permitido é ${MAX_DATE_RANGE_DAYS} dias`
                  );
                  return;
                }

                setDateRange({ from, to });
              }}
            />
          </div>
        </div>
      </div>
      <div className='p-4 sm:p-8'>
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  );
}

export default TransactionPage;
