/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect } from 'react'
import { TransactionType } from "@/lib/types"
import { useQuery } from '@tanstack/react-query';
import { category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import CreateCategoryDialog from './CreateCategoryDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    type: TransactionType
    onChange: (value: string) => void
}

function CategoryPicker({ type, onChange }: Props) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("");
  
  
  useEffect(() => {
    if(!value) return
    onChange(value)
  }, [onChange, value]) 

  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () => fetch(`/api/categories?type=${type}`).then((res) => res.json())
  })
  
  const selectedCategory = categoriesQuery.data?.find((category: category) => category.name === value)

  const onSuccessCallback = useCallback((category: category) => {
        setValue(category.name)
        setOpen((prev) => !prev)
  }, [])
  

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className='w-[200px] justify-between'
            >
              {selectedCategory ? (<CategoryRow category={selectedCategory} />) : ("Selecione uma categoria")}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
            </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0'>
            <Command onSubmit={(e) => e.preventDefault()}>
                <CommandInput placeholder='Procure a categoria...'/> 
                <CreateCategoryDialog type={type} successCallback={onSuccessCallback} />
                <CommandEmpty>
                    <p>Categoria não encontrada</p>
                </CommandEmpty>
                <CommandGroup>
                    <CommandList>
                        {
                            categoriesQuery.data && categoriesQuery.data.map((c: category) => (
                                <CommandItem 
                                    key={c.name}
                                    onSelect={() => {
                                        setValue(c.name);
                                        setOpen((prev) => !prev);
                                    }}
                                >
                                    <CategoryRow category={c} />
                                    <Check className={cn("ml-5 w-4 h-4 opacity-0", 
                                        value === c.name && "opacity-100"
                                    )} />
                                </CommandItem>
                            ))
                        }
                    </CommandList>
                </CommandGroup>
            </Command>
        </PopoverContent>
    </Popover>
  )
}


function CategoryRow({ category }: { category: category }){
    return (
        <div className='flex items-center gap-2'>
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>
    )
}

export default CategoryPicker