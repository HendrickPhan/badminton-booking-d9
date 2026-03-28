'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  options: ConfirmOptions
}

export function ConfirmDialog({ open, onOpenChange, onConfirm, options }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{options.cancelText || 'Hủy'}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={options.destructive ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {options.confirmText || 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easier usage
export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    description: '',
  })
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setOpen(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    resolveRef?.(true)
  }, [resolveRef])

  const handleCancel = useCallback(() => {
    setOpen(false)
    resolveRef?.(false)
  }, [resolveRef])

  return {
    confirm,
    dialog: (
      <AlertDialog open={open} onOpenChange={(v) => { if (!v) handleCancel() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{options.cancelText || 'Hủy'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={options.destructive ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {options.confirmText || 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  }
}
