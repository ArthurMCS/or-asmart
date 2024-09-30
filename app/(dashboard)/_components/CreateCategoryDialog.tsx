import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent  } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { category } from '@prisma/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { useTheme } from 'next-themes';
import pt from '@emoji-mart/data/i18n/pt.json';

interface Props {
    type: TransactionType;
    successCallback: (category: category) => void
}

function CreateCategoryDialog({ type, successCallback }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
        type
    }
  })

  const queryClient = useQueryClient();
  const theme = useTheme()
  
  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: category) => {
        form.reset({
            icon: '',
            name: '',
            type,
        })

        toast.success(`Categoria ${data.name} criada com sucesso 🎉`, {
            id: 'create-category'
        })

        successCallback(data)

        await queryClient.invalidateQueries({
            queryKey: ['categories'],
        })

        setOpen((prev => !prev))
    },

    onError: () => {
        toast.error('Algo deu errado!', {
            id: 'create-category'
        })
    }
  })

  const onSubmit = useCallback(
    (values: CreateCategorySchemaType) => {
        toast.loading("Creating category...", {
            id: "create-category",
        });
    
        mutate(values)
      }, [mutate]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
               <Button 
                    variant="ghost" 
                    className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground w-full'
                >
                    <PlusSquare className='mr-2 h-4 w-4' />
                     Crie uma nova
                </Button> 
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {type === 'income' ? 'Crie uma nova' : 'Crie um novo'}{" "}
                    <span className={
                        cn("m-1",
                            type === 'income' ? 'text-emerald-500' : 'text-red-500'
                        )
                    }>
                        {type === 'income' ? 'Renda' : 'Gasto' }
                    </span>
                </DialogTitle>
                <DialogDescription>
                    Categorias para classificar as suas movimentações
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form  onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField 
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder={"Categoria"} {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Escolha um nome para sua categoria
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ícone</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className='h-[100px] w-full'>
                                                {form.watch("icon") 
                                                ? <span className='text-5xl' role="img">
                                                    {field.value}
                                                </span> 
                                                : <div className='flex flex-col items-center gap-2'>
                                                        <CircleOff className='h-[48px] w-[48px]'/>
                                                        <p className='text-xs text-muted-foreground'>
                                                            Click para selecionar
                                                        </p>
                                                    </div>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-full'>
                                             <Picker 
                                                data={data}
                                                locale={pt}
                                                theme={theme.resolvedTheme}
                                                onEmojiSelect={(emoji: { native: string; }) => {
                                                field.onChange(emoji.native)
                                             }}/>      
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    Escolha um ícone para sua categoria
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                </form>
            </Form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {form.reset()}}
                    >
                        Cancelar
                    </Button>
                </DialogClose>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                        {!isPending && 'Criar'}
                        {isPending && <Loader2 className='animate-spin'/>}
                    </Button>            
            </DialogFooter>
        </DialogContent>

    </Dialog>
  )
}

export default CreateCategoryDialog