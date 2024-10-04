/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query';
import { Responsible } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import CreateResponsibleDialog from './CreateResponsibleDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    onChange: (value: string) => void
}

function ResponsiblePicker({ onChange }: Props) {
    const [open, setOpen] = React.useState(false)
    const [responsibleId, setResponsible] = React.useState("")

    useEffect(() => {
        if (!responsibleId) return
        onChange(responsibleId)
    }, [onChange, responsibleId])

    const responsiblesQuery = useQuery({
        queryKey: ['responsible', responsibleId],
        queryFn: () => fetch(`/api/responsibles?id=${responsibleId}`).then((res) => res.json())
    })

    const selectedResponsible = responsiblesQuery.data?.find((responsible: Responsible) => responsible.id === responsibleId)

    const onSuccessCallback = useCallback((responsible: Responsible) => {
        setResponsible(responsible.id)
        setOpen((prev) => !prev)
    }, [])


    let responsables = new Array<Responsible>;
    const addResponsible = (resp: Responsible) => {
        setOpen((prev) => !prev)

        responsables.push(resp)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className='w-[220px] justify-between'
                >
                    {selectedResponsible ?
                        (<ResponsibleRow responsible={selectedResponsible} />) :
                        ("Selecione os responsaveis")
                    }
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0'>
                <Command onSubmit={(e) => e.preventDefault()}>
                    <CommandInput placeholder='Procure o responsavel...' />
                    <CreateResponsibleDialog successCallback={onSuccessCallback} />
                    <CommandEmpty>
                        <p>Responsável não encontrado</p>
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {
                                responsiblesQuery.data && responsiblesQuery.data.map((c: Responsible) => (
                                    <CommandItem
                                        key={c.id}
                                        onSelect={() => {
                                            setResponsible(c.id);
                                            setOpen((prev) => !prev);
                                        }}
                                    >
                                        <ResponsibleRow responsible={c} />
                                        <Check className={cn("ml-5 w-4 h-4 opacity-0",
                                            // responsables.some(res => res.id === c.id) && "opacity-100"
                                            responsibleId === c.id && "opacity-100"
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


function ResponsibleRow({ responsible }: { responsible: Responsible }) {
    return (
        <div className='flex items-center gap-2'>
            <span key={responsible.id}>{responsible.name} - {responsible.color}</span>
        </div>
    )
}

export default ResponsiblePicker