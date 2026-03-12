"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconUpload, IconX, IconLoader2, IconPhoto, IconTrash } from "@tabler/icons-react"
import { expensesApi } from "@/lib/api"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ReceiptUploadProps {
  expenseId: string
  currentReceiptUrl?: string | null
  onUploadSuccess?: (receiptUrl: string) => void
  onDeleteSuccess?: () => void
}

export function ReceiptUpload({
  expenseId,
  currentReceiptUrl,
  onUploadSuccess,
  onDeleteSuccess
}: ReceiptUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const receiptUrl = currentReceiptUrl
    ? (currentReceiptUrl.startsWith('http') ? currentReceiptUrl : `${API_URL}/${currentReceiptUrl.replace(/^\/api\//, '')}`)
    : null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/) && file.type !== 'application/pdf') {
      setError('Please upload an image (JPG, PNG, GIF, WebP) or PDF file')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    const result = await expensesApi.uploadReceipt(expenseId, file)

    if (result.error) {
      setError(result.error)
      setPreview(null)
    } else if (result.data) {
      onUploadSuccess?.(result.data.receiptUrl)
      setIsOpen(false)
      setPreview(null)
    }

    setIsUploading(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    const result = await expensesApi.deleteReceipt(expenseId)

    if (result.error) {
      setError(result.error)
    } else {
      onDeleteSuccess?.()
      setPreview(null)
    }

    setIsDeleting(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {receiptUrl ? (
            <>
              <IconPhoto className="h-4 w-4" />
              View Receipt
            </>
          ) : (
            <>
              <IconUpload className="h-4 w-4" />
              Upload Receipt
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {receiptUrl ? 'Receipt' : 'Upload Receipt'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {receiptUrl && !preview ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-[3/4] bg-white/5 rounded-lg overflow-hidden">
              <Image
                src={receiptUrl}
                alt="Receipt"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <IconUpload className="h-4 w-4" />
                Replace
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconTrash className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <IconLoader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : preview ? (
              <div className="relative w-full aspect-[3/4] bg-white/5 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <IconUpload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop your receipt here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse (JPG, PNG, GIF, WebP, PDF up to 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
