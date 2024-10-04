import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateResponsibleSchema, CreateResponsibleSchemaType } from '@/schema/responsible';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusSquare } from 'lucide-react';
import React, { ReactNode, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import data from '@emoji-mart/data';
import { Responsible } from '@prisma/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateResponsible } from '../_actions/responsible';
import { useTheme } from 'next-themes';

interface Props {
    successCallback: (responsible: Responsible) => void
    trigger?: ReactNode
}

function CreateResponsibleDialog({ successCallback, trigger }: Props) {
    const getRandomHexColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`;
    }

    const [open, setOpen] = useState(false);
    const form = useForm<CreateResponsibleSchemaType>({
        resolver: zodResolver(CreateResponsibleSchema),
        defaultValues: {
            color: getRandomHexColor()
        }
    })

    const queryClient = useQueryClient();
    const theme = useTheme()

    const { mutate, isPending } = useMutation({
        mutationFn: CreateResponsible,
        onSuccess: async (data: Responsible) => {
            form.reset({
                name: '',
                color: '',
            })

            toast.success(`Responsável ${data.name} criado com sucesso 🎉`, {
                id: 'create-responsible'
            })

            successCallback(data)

            await queryClient.invalidateQueries({
                queryKey: ['responsables'],
            })

            setOpen((prev => !prev))
        },

        onError: () => {
            toast.error('Algo deu errado!', {
                id: 'create-responsible'
            })
        }
    })

    const onSubmit = useCallback(
        (value: CreateResponsibleSchemaType) => {            
            toast.loading("Creating responsible...", {
                id: "create-responsible",
            });

            mutate(value)
        }, [mutate]
    )

    // let responsibles = new Array<Responsible>()
    // const onCreate = () => {
    //     form.setValue("color", getRandomHexColor())

    //     const id = ""

    //     const aux: Responsible = {
    //         id: id,
    //         ...form.getValues()
    //     }

    //     responsibles.push(aux)

    //     form.reset({
    //         name: "",
    //         color: "",
    //     })
    // }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button
                        variant="ghost"
                        className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground w-full'
                    >
                        <PlusSquare className='mr-2 h-4 w-4' />
                        Crie um novo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Crie um responsaveis
                    </DialogTitle>
                    <DialogDescription>
                        Responsaveis de movimentações
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder={"Responsaveis"} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Escolha o nome do responsável
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
                            onClick={() => { form.reset() }}
                        >
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                        {!isPending && 'Criar'}
                        {isPending && <Loader2 className='animate-spin' />}
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default CreateResponsibleDialog