"use client"
import React, { ReactNode } from 'react';
import { category } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteCategory } from '../_actions/categories';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertDescription } from '@/components/ui/alert';
import { TransactionType } from '@/lib/types';

interface Props {
    trigger: ReactNode
    category: category
}

function DeleteCategoryDialog({ trigger, category }: Props) {
    const categoryIdentifier = `${category.name}-${category.type}`
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success("Categoria excluída com sucesso!", {
                id: categoryIdentifier
            })

            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            })
        },

        onError: () => {
            toast.success("Error ao excluir categoria", {
                id: categoryIdentifier
            })
        }
    })
  return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza disso?</AlertDialogTitle>
                    <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading("Excluíndo categoria...", {
                            id: categoryIdentifier
                        })
                        deleteMutation.mutate({
                            name: category.name,
                            type: category.type as TransactionType
                        })
                    }}>
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
  )
}

export default DeleteCategoryDialog