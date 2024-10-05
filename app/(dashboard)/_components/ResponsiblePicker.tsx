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
    const [responsibles, setResponsibleIds] = React.useState<Responsible[]>([]);

    const responsiblesQuery = useQuery({
        queryKey: ['responsible'],
        queryFn: () => fetch(`/api/responsibles`).then((res) => res.json())
    })

    // Função para adicionar responsável, garantindo que ele não esteja duplicado
    const onSuccessCallback = useCallback((responsible: Responsible) => {
        addResponsible(responsible)
        setOpen((prev) => !prev);
    }, []);

    const addResponsible = (resp: Responsible) => {
        setResponsibleIds((prevResp) => {
            if (prevResp.some((r) => r.id === resp.id)) {                
                return prevResp.filter((r) => r.id !== resp.id);
            }
            else {
                return [...prevResp, resp];
            }
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className='w-[220px] justify-between'
                >
                    {responsibles ?
                        (<ResponsibleSelectedRow responsibles={responsibles} />) :
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
                                            addResponsible(c);
                                            setOpen((prev) => !prev);
                                        }}
                                    >
                                        <ResponsibleRow responsible={c} />
                                        <Check className={cn("ml-5 w-4 h-4 opacity-0",
                                            responsibles.some(res => res.id === c.id) && "opacity-100"
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
        <div key={responsible.id} className="flex items-center gap-2">
            <div
                style={{ backgroundColor: responsible.color }}
                className="w-3 h-3 rounded-full"
            />
            <span>{responsible.name}</span>
        </div>
    )
}

function ResponsibleSelectedRow({ responsibles }: { responsibles: Array<Responsible> }) {
    return (
        <div className='flex items-center gap-2'>
            {responsibles.length > 2 ? (
                <>
                    {responsibles.slice(0, 2).map((responsible) => (
                        <ResponsibleRow responsible={responsible}></ResponsibleRow>
                    ))}
                    <span>+ {responsibles.length - 2}</span>
                </>
            ) : (
                responsibles.map((responsible) => (
                    <ResponsibleRow responsible={responsible}></ResponsibleRow>
                ))
            )}
        </div>
    );
}



export default ResponsiblePicker