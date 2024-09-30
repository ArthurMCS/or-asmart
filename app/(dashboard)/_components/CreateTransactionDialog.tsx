"use client";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ReactNode, useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
    trigger: ReactNode;
    type: TransactionType;
}

import React from 'react'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transaction";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";

function CreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
     resolver: zodResolver(CreateTransactionSchema),
     defaultValues: {
        type,
        date: new Date()
     },
  })

  const [open, setOpen] = useState(false)


  const handleCategoryChange = useCallback((value: string) => {
    form.setValue('category', value)
  }, [form])

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
        toast.success("Movimentação criada com sucesso 🎉", {
            id: "create-transaction",
        })

        form.reset({
            type,
            description: '',
            amount: 0,
            date: new Date(),
            category: undefined,
        })

        queryClient.invalidateQueries({
            queryKey: ["overview"]
        })

        setOpen((prev) => !prev)
    }
  })


  const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading('Criando movimentação...', {
            id: 'create-transaction'
        })

        mutate({
            ...values,
            date: DateToUTCDate(values.date)
        })
  }, [mutate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {type === "income" ? "Crie uma nova" : "Crie um novo"}<span className={cn(
                        "m-1 font-bold",
                        type === 'income' ? "text-emerald-500" : "text-red-500"
                    )}>{type === "income" ? 'RENDA' : 'GASTO'}</span>
                    </DialogTitle>
            </DialogHeader>

            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField 
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Input defaultValue={""} {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Descrição da movimentação (opcional)
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                    <Input defaultValue={0} type="number" {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Descrição da movimentação (opcional)
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    Tipo: {form.watch('category')}    

                    <div className="flex items-center justify-between gap-2">
                        <FormField 
                            control={form.control}
                            name="category"
                            render={() => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Categoria: </FormLabel>
                                    <FormControl>
                                        <CategoryPicker type={type} onChange={handleCategoryChange}/>
                                    </FormControl>
                                    <FormDescription>
                                        Seleciona uma categoria para essa movimentação
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data da movimentação</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("w-[200px] pl-3 text-left font-normal",
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            > 
                                                {field.value ? (formatDate(field.value, 'dd/MM/yyyy')) : (<span>Escolha a data</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar 
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(value) => {
                                                    if(!value) return;
                                                    field.onChange(value)
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Seleciona a data dessa movimentação
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button 
                        type="button"
                        variant="secondary"
                        onClick={() => {form.reset()}}
                    >
                        Cancel
                    </Button>           
                </DialogClose>
                <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    {!isPending && 'Criar'}
                    {isPending && <Loader2  className="animate-spin"/>}
                </Button>               
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog

