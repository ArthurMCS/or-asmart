"use client"

import { CurrencyComboBox } from '@/components/CurrencyComboBox'
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionType } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import CreateCategoryDialog from '../_components/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { category } from '@prisma/client'
import DeleteCategoryDialog from '../_components/DeleteCategoryDialog'

function page() {
  return (
    <>
      {/* HEADER */}
      <div className='border-b bg-card'>
        <div className='flex flex-wrap items-center justify-between gap-6 py-8 px-4 sm:px-8'>
          <div>
            <p className='text-xl sm:text-2xl lg:text-3xl font-bold'>Configurações</p>
            <p className='text-muted-foreground'>Gerencie suas configurações e categorias</p>
          </div>
        </div>
      </div>
      {/* HEADER END */}

      <div className='flex flex-col gap-4 p-4 sm:p-8'>
        <Card>
          <CardHeader>
            <CardTitle>Moeda</CardTitle>
            <CardDescription>
              Escolha a moeda padrão para suas movimentações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  )
}

export default page

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: () => fetch(`/api/categories?type=${type}`).then(res => res.json())
  })

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              {type === 'expense' ? (
                <TrendingDown className='h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500' />
              ) : (
                <TrendingUp className='h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500' />
              )}
              <div>
                {type === 'income' ? 'Categorias de ganhos' : 'Categorias de gastos'}
                <div className='text-sm text-muted-foreground'>Ordenado por nome</div>
              </div>
            </div>
            <div>
              <CreateCategoryDialog
                type={type}
                successCallback={() => categoriesQuery.refetch()}
                trigger={
                      <Button className="gap-2 text-sm font-bold">
                        <PlusSquare className='h-4 w-4' />
                        
                        <span className='hidden md:block'>Crie uma categoria</span>
                      </Button>
                }
              />
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className='flex h-40 w-full flex-col items-center justify-center'>
            <p>
              Sem categorias para
              <span className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>
                {type === "income" ? "Ganhos" : "Gastos"}
              </span>
            </p>
            <p className='text-sm text-muted-foreground'>Crie uma para começar</p>
          </div>
        )}
        {dataAvailable && (
          <div className='grid grid-flow-row gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {categoriesQuery.data.map((category: category) => (
              <CategoryCard category={category} key={category.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  )
}

function CategoryCard({ category }: { category: category }) {
  return (
    <div className='flex flex-col justify-between rounded-md border shadow-md p-4'>
      <div className='flex flex-col items-center gap-2'>
        <span className='text-3xl' role="img">
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <DeleteCategoryDialog category={category} trigger={
        <Button
          className='flex w-full items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20'
          variant="secondary"
        >
          <TrashIcon className='h-4 w-4' />
          Excluir
        </Button>
      } />
    </div>
  )
}
