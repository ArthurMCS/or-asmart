import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'
import { DeleteTransaction } from '../_actions/DeleteTransaction'

interface Props {
    open: boolean,
    setOpen: (open: boolean) => void
    transactionId: string
}


function DeleteTranactionDialog({ open, setOpen, transactionId}: Props) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            toast.success("Movimentação excluída com sucesso!", {
                id: transactionId
            })

            await queryClient.invalidateQueries({
                queryKey: ["transactions"]
            })
        },

        onError: () => {
            toast.error("Error ao excluír movimentação", {
                id: transactionId
            })
        }
    })
  return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza disso?</AlertDialogTitle>
                    <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading("Excluíndo movimentação...", {
                            id: transactionId
                        })
                        deleteMutation.mutate(transactionId)
                    }}>
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
  )
}

export default DeleteTranactionDialog