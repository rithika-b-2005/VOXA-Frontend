"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { IconPlus, IconUpload, IconSearch, IconChevronDown, IconTrash, IconEdit, IconPaperclip, IconPhoto, IconX, IconLoader2, IconFileSpreadsheet, IconDownload, IconBrandWhatsapp, IconShare, IconLock, IconCrown, IconSparkles, IconMicrophone, IconPlayerStop, IconCheck, IconTag } from "@tabler/icons-react"
import { expensesApi } from "@/lib/api"
import { StripePaymentModal } from "@/components/stripe"
import * as XLSX from 'xlsx'
import { VoxaAI } from "@/components/VoxaAI"
import { VoiceLanguageSelector } from "@/components/voice"
import {
  supportedLanguages,
  DEFAULT_VOICE_LANGUAGE,
  getVoiceText,
  VoiceTranslationKeys,
  expenseKeywords,
  incomeKeywords,
  yesKeywords,
  noKeywords,
  extractNumber,
  containsKeyword,
  matchCategory,
  speak as ttsSpeak,
  cancelSpeech,
  loadVoices,
  playAudio,
  audioGreetings,
} from "@/lib/voice"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
import { useExpenses, useCategories } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/DatePicker"
import { Checkbox } from "@/components/ui/checkbox"

interface Transaction {
  id: string
  date: string
  category: string
  categoryId: string | null
  payee: string
  amount: number
  type: "Expense" | "Income"
  paymentMode: string
  receipt?: string
  interestTags?: string[]
}

// Predefined interest tags for categorizing expenses by personal interests/lifestyle
const INTEREST_TAGS = [
  { id: "essential", label: "Essential", color: "bg-blue-500" },
  { id: "lifestyle", label: "Lifestyle", color: "bg-purple-500" },
  { id: "entertainment", label: "Entertainment", color: "bg-pink-500" },
  { id: "health", label: "Health & Wellness", color: "bg-green-500" },
  { id: "education", label: "Education", color: "bg-cyan-500" },
  { id: "travel", label: "Travel", color: "bg-orange-500" },
  { id: "social", label: "Social", color: "bg-rose-500" },
  { id: "hobby", label: "Hobby", color: "bg-indigo-500" },
  { id: "investment", label: "Investment", color: "bg-emerald-500" },
  { id: "impulse", label: "Impulse Buy", color: "bg-red-500" },
  { id: "recurring", label: "Recurring", color: "bg-yellow-500" },
  { id: "gift", label: "Gift", color: "bg-fuchsia-500" },
]

export default function TransactionPage() {
  const { user } = useAuth()
  const { data: categoriesData } = useCategories()
  const isPremium = user?.isPremium ?? false

  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [addNewOpen, setAddNewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [receiptViewOpen, setReceiptViewOpen] = React.useState(false)
  const [viewingReceipt, setViewingReceipt] = React.useState<string>("")
  const [importOption, setImportOption] = React.useState<"replace" | "append">("replace")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterDate, setFilterDate] = React.useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Format date for API filter (YYYY-MM-DD) - filters by createdAt on backend
  // Use local date to avoid timezone issues
  const filterDateStr = filterDate
    ? `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-${String(filterDate.getDate()).padStart(2, '0')}`
    : undefined
  const { data: expensesData, loading, error, refetch } = useExpenses({ date: filterDateStr })

  // Add form states
  const [newPayee, setNewPayee] = React.useState("")
  const [newAmount, setNewAmount] = React.useState("")
  const [newCategory, setNewCategory] = React.useState("")
  const [newDate, setNewDate] = React.useState<Date>(new Date())
  const [transactionType, setTransactionType] = React.useState<"expense" | "income">("expense")
  const [paymentType, setPaymentType] = React.useState("")
  const [newReceipt, setNewReceipt] = React.useState<string>("")
  const [newReceiptName, setNewReceiptName] = React.useState("")

  // Receipt upload state
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string>("")

  // Import state
  const [importFile, setImportFile] = React.useState<File | null>(null)
  const [importFileName, setImportFileName] = React.useState<string>("")
  const [isImporting, setIsImporting] = React.useState(false)
  const [isPreviewing, setIsPreviewing] = React.useState(false)
  const [importError, setImportError] = React.useState<string>("")
  const [importResult, setImportResult] = React.useState<{ success: number; failed: number } | null>(null)
  const [importPreview, setImportPreview] = React.useState<Array<{ date: string; description: string; amount: number; merchant?: string; category?: string }> | null>(null)

  // Premium upgrade dialog state
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false)
  const [premiumFeature, setPremiumFeature] = React.useState<"export" | "share" | "transactions" | "import" | "voice">("export")
  const [selectedPlan, setSelectedPlan] = React.useState<"monthly" | "yearly">("yearly")
  const [paymentError, setPaymentError] = React.useState<string | null>(null)
  const [showStripeModal, setShowStripeModal] = React.useState(false)

  // Credit costs
  const EXPORT_CREDIT_COST = 10
  const SHARE_CREDIT_COST = 10
  const ADD_NEW_CREDIT_COST = 10
  const IMPORT_CREDIT_COST = 10
  const VOICE_CREDIT_COST = 1

  // Free credits for non-premium users (stored in localStorage)
  // First time users get to see premium popup, after that they need credits
  const [hasSeenExportPremium, setHasSeenExportPremium] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voxa_seen_export_premium') === 'true'
    }
    return false
  })
  const [hasSeenSharePremium, setHasSeenSharePremium] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voxa_seen_share_premium') === 'true'
    }
    return false
  })

  const [importCredits, setImportCredits] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_import_credits')
      return stored !== null ? parseInt(stored, 10) : 10
    }
    return 10
  })
  const [exportCredits, setExportCredits] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_export_credits')
      return stored !== null ? parseInt(stored, 10) : 10
    }
    return 10
  })
  const [shareCredits, setShareCredits] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_share_credits')
      return stored !== null ? parseInt(stored, 10) : 10
    }
    return 10
  })
  const [addNewCredits, setAddNewCredits] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_add_new_credits')
      return stored !== null ? parseInt(stored, 10) : 10
    }
    return 10
  })
  const [voiceCredits, setVoiceCredits] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_voice_credits')
      return stored !== null ? parseInt(stored, 10) : 10
    }
    return 10
  })

  // Save credits to localStorage when they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_import_credits', importCredits.toString())
    }
  }, [importCredits])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_export_credits', exportCredits.toString())
    }
  }, [exportCredits])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_share_credits', shareCredits.toString())
    }
  }, [shareCredits])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_add_new_credits', addNewCredits.toString())
    }
  }, [addNewCredits])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_voice_credits', voiceCredits.toString())
    }
  }, [voiceCredits])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_seen_export_premium', hasSeenExportPremium.toString())
    }
  }, [hasSeenExportPremium])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_seen_share_premium', hasSeenSharePremium.toString())
    }
  }, [hasSeenSharePremium])

  // Edit form states
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editPayee, setEditPayee] = React.useState("")
  const [editAmount, setEditAmount] = React.useState("")
  const [editCategory, setEditCategory] = React.useState("")
  const [editDate, setEditDate] = React.useState<Date>(new Date())
  const [editTransactionType, setEditTransactionType] = React.useState<"expense" | "income">("expense")
  const [editPaymentMode, setEditPaymentMode] = React.useState("")
  const [editReceipt, setEditReceipt] = React.useState<string>("")
  const [editReceiptName, setEditReceiptName] = React.useState("")

  // Interest tags states
  const [transactionTags, setTransactionTags] = React.useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxa_transaction_tags')
      return stored ? JSON.parse(stored) : {}
    }
    return {}
  })
  const [newInterestTags, setNewInterestTags] = React.useState<string[]>([])
  const [editInterestTags, setEditInterestTags] = React.useState<string[]>([])

  // Save transaction tags to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxa_transaction_tags', JSON.stringify(transactionTags))
    }
  }, [transactionTags])

  // Voice input states
  const [voiceDialogOpen, setVoiceDialogOpen] = React.useState(false)
  const [micPermissionDialogOpen, setMicPermissionDialogOpen] = React.useState(false)
  const [micPermissionStatus, setMicPermissionStatus] = React.useState<"prompt" | "granted" | "denied" | "checking">("checking")
  const [isListening, setIsListening] = React.useState(false)
  const [voiceStep, setVoiceStep] = React.useState<"language" | "type" | "amount" | "payer" | "reason" | "description" | "category" | "payment" | "confirm" | "done">("language")
  const [voiceTransactionType, setVoiceTransactionType] = React.useState<"expense" | "income">("expense")
  const [voiceAmount, setVoiceAmount] = React.useState("")
  const [voicePayer, setVoicePayer] = React.useState("")
  const [voiceReason, setVoiceReason] = React.useState("")
  const [voiceDescription, setVoiceDescription] = React.useState("")
  const [voiceCategory, setVoiceCategory] = React.useState("")
  const [voiceCategoryName, setVoiceCategoryName] = React.useState("")
  const [voicePaymentMode, setVoicePaymentMode] = React.useState("")
  const [voiceTranscript, setVoiceTranscript] = React.useState("")
  const [voiceMessage, setVoiceMessage] = React.useState("")
  const [isProcessingVoice, setIsProcessingVoice] = React.useState(false)
  const [voiceLanguage, setVoiceLanguage] = React.useState<string>("")
  const recognitionRef = React.useRef<any>(null)

  // Helper to get voice text with current language
  const t = (key: VoiceTranslationKeys, replacements?: Record<string, string>) =>
    getVoiceText(key, voiceLanguage, replacements)

  // Handle language change with voice greeting
  const handleLanguageChange = (newLang: string) => {
    setVoiceLanguage(newLang)
    // Cancel any ongoing speech
    cancelSpeech()

    // Speak the language greeting in the new language
    const greetingText = getVoiceText("languageGreeting", newLang)

    // Small delay to ensure the language is set before speaking
    setTimeout(() => {
      ttsSpeak(greetingText, newLang, {
        useCloudFallback: true,
        onStart: () => console.log(`Language changed to ${newLang}`),
        onError: (error) => console.error('TTS Error on language change:', error),
      }).catch(err => console.error('TTS failed:', err))
    }, 100)
  }

  // Load TTS voices and check microphone permission on mount
  React.useEffect(() => {
    checkMicrophonePermission()
    // Load browser voices for TTS
    loadVoices().then((voices) => {
      console.log('Loaded voices:', voices.length)
      // Log Tamil voices specifically
      const tamilVoices = voices.filter(v => v.lang.startsWith('ta'))
      console.log('Tamil voices:', tamilVoices.map(v => `${v.name} (${v.lang})`))
    })
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicPermissionStatus(result.state as "prompt" | "granted" | "denied")

        // Listen for permission changes
        result.onchange = () => {
          setMicPermissionStatus(result.state as "prompt" | "granted" | "denied")
        }
      } else {
        // Fallback for browsers that don't support permissions API
        setMicPermissionStatus("prompt")
      }
    } catch (err) {
      console.log('Permission check not supported, will ask when needed')
      setMicPermissionStatus("prompt")
    }
  }

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop all tracks after getting permission
      stream.getTracks().forEach(track => track.stop())
      setMicPermissionStatus("granted")
      return true
    } catch (err: any) {
      console.error('Microphone permission error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionStatus("denied")
      }
      return false
    }
  }

  // Transform API data to Transaction format
  const transactions: Transaction[] = React.useMemo(() => {
    if (!expensesData || !Array.isArray(expensesData)) return []
    return (expensesData as any[]).map((expense: any) => ({
      id: expense.id,
      date: new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      category: expense.category?.name || "Other",
      categoryId: expense.categoryId,
      payee: expense.merchant || expense.description || "Unknown",
      amount: expense.amount,
      type: expense.amount >= 0 ? "Income" : "Expense",
      paymentMode: expense.currency || "USD",
      receipt: expense.receiptUrl || "",
      interestTags: transactionTags[expense.id] || []
    }))
  }, [expensesData, transactionTags])

  // Get categories from API
  const categories = React.useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return []
    return (categoriesData as any[]).map((cat: any) => ({ id: cat.id, name: cat.name }))
  }, [categoriesData])

  // Client-side filtering for search only (date filtering is done by API based on createdAt)
  const filteredTransactions = transactions.filter(t =>
    t.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === filteredTransactions.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredTransactions.map(t => t.id))
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await Promise.all(selectedRows.map(id => expensesApi.delete(id)))
      setSelectedRows([])
      refetch()
    } catch (err) {
      console.error("Failed to delete expenses:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const transaction = transactions.find(t => t.id === selectedRows[0])
      if (transaction) {
        setEditingId(transaction.id)
        setEditPayee(transaction.payee)
        setEditAmount(Math.abs(transaction.amount).toString())
        setEditCategory(transaction.categoryId || "")
        setEditTransactionType(transaction.type === "Income" ? "income" : "expense")
        setEditPaymentMode(transaction.paymentMode)
        setEditReceipt(transaction.receipt || "")
        setEditReceiptName(transaction.receipt ? "Existing receipt" : "")
        setEditInterestTags(transaction.interestTags || [])
        setEditOpen(true)
      }
    }
  }

  // Store the actual file for upload
  const [newReceiptFile, setNewReceiptFile] = React.useState<File | null>(null)
  const [editReceiptFile, setEditReceiptFile] = React.useState<File | null>(null)

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      // Clear previous error
      setUploadError("")

      // Validate file type - allow all images and PDFs
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setUploadError(`File type ${file.type || 'unknown'} is not supported. Please upload an image or PDF.`)
        return
      }

      // Store the file for later upload
      if (isEdit) {
        setEditReceiptFile(file)
      } else {
        setNewReceiptFile(file)
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        if (isEdit) {
          setEditReceipt(base64)
          setEditReceiptName(file.name)
        } else {
          setNewReceipt(base64)
          setNewReceiptName(file.name)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTransaction = async () => {
    // Check credits for non-premium users
    if (!isPremium && addNewCredits < ADD_NEW_CREDIT_COST) {
      setAddNewOpen(false)
      setPremiumFeature("transactions")
      setPremiumDialogOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const amount = transactionType === "expense" ? -parseFloat(newAmount) : parseFloat(newAmount)
      const { data, error } = await expensesApi.create({
        amount,
        date: newDate.toISOString(),
        description: newPayee,
        merchant: newPayee,
        categoryId: newCategory || undefined,
        currency: paymentType || "USD"
      })
      if (error) {
        console.error("Failed to create expense:", error)
      } else {
        // Deduct credits for non-premium users
        if (!isPremium) {
          setAddNewCredits(prev => Math.max(0, prev - ADD_NEW_CREDIT_COST))
        }
        // Upload receipt if file was selected
        if (newReceiptFile && data?.id) {
          await expensesApi.uploadReceipt(data.id, newReceiptFile)
        }
        // Save interest tags to localStorage
        if (data?.id && newInterestTags.length > 0) {
          setTransactionTags(prev => ({ ...prev, [data.id]: newInterestTags }))
        }
        setAddNewOpen(false)
        resetAddForm()
        refetch()
      }
    } catch (err) {
      console.error("Failed to create expense:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setIsSubmitting(true)
    try {
      const amount = editTransactionType === "expense" ? -parseFloat(editAmount) : parseFloat(editAmount)
      const { error } = await expensesApi.update(editingId, {
        amount,
        description: editPayee,
        merchant: editPayee,
        categoryId: editCategory || undefined,
        currency: editPaymentMode || "USD"
      })
      if (error) {
        console.error("Failed to update expense:", error)
      } else {
        // Upload receipt if new file was selected
        if (editReceiptFile) {
          await expensesApi.uploadReceipt(editingId, editReceiptFile)
        }
        // Save interest tags to localStorage
        setTransactionTags(prev => ({ ...prev, [editingId]: editInterestTags }))
        setEditOpen(false)
        setSelectedRows([])
        setEditingId(null)
        setEditReceiptFile(null)
        setEditInterestTags([])
        refetch()
      }
    } catch (err) {
      console.error("Failed to update expense:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAddForm = () => {
    setNewPayee("")
    setNewAmount("")
    setNewCategory("")
    setTransactionType("expense")
    setPaymentType("")
    setNewReceipt("")
    setNewReceiptName("")
    setNewReceiptFile(null)
    setUploadError("")
    setNewInterestTags([])
  }

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportError("")
      setImportResult(null)
      setImportPreview(null)

      // Validate file type
      const validExtensions = ['.csv', '.xls', '.xlsx']
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
      if (!validExtensions.includes(ext)) {
        setImportError('Please upload a CSV or Excel file (.csv, .xls, .xlsx)')
        return
      }

      setImportFile(file)
      setImportFileName(file.name)

      // Fetch preview
      setIsPreviewing(true)
      try {
        const { data, error } = await expensesApi.previewImport(file)
        if (error) {
          setImportError(error)
        } else if (data) {
          setImportPreview(data.transactions)
        }
      } catch (err) {
        setImportError('Failed to preview file. Please try again.')
      } finally {
        setIsPreviewing(false)
      }
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import')
      return
    }

    setIsImporting(true)
    setImportError("")
    setImportResult(null)

    try {
      const { data, error } = await expensesApi.importTransactions(importFile, importOption === 'replace')

      if (error) {
        setImportError(error)
      } else if (data) {
        setImportResult({ success: data.success, failed: data.failed })
        if (data.success > 0) {
          refetch()
          // Deduct import credits for non-premium users
          if (!isPremium) {
            setImportCredits(prev => Math.max(0, prev - IMPORT_CREDIT_COST))
          }
        }
        // Reset file input after successful import
        if (data.success > 0 && data.failed === 0) {
          setTimeout(() => {
            setImportOpen(false)
            setImportFile(null)
            setImportFileName("")
            setImportResult(null)
          }, 2000)
        }
      }
    } catch (err) {
      setImportError('Failed to import transactions. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const resetImportState = () => {
    setImportFile(null)
    setImportFileName("")
    setImportError("")
    setImportResult(null)
    setImportPreview(null)
  }

  const handleViewReceipt = (receipt: string) => {
    // Handle both base64 and URL receipts
    const receiptUrl = receipt.startsWith('data:') || receipt.startsWith('http')
      ? receipt
      : `${API_URL}/${receipt.replace(/^\/api\//, '')}`
    setViewingReceipt(receiptUrl)
    setReceiptViewOpen(true)
  }

  const getReceiptUrl = (receipt: string) => {
    if (!receipt) return null
    if (receipt.startsWith('data:') || receipt.startsWith('http')) return receipt
    return `${API_URL}/${receipt.replace(/^\/api\//, '')}`
  }

  // Export to Excel (Premium feature - API validates premium status)
  const handleExportExcel = async () => {
    try {
      const transactionIds = selectedRows.length > 0 ? selectedRows : undefined
      const { data, error } = await expensesApi.exportTransactions(transactionIds)

      if (error) {
        alert(error)
        return
      }

      if (!data || data.length === 0) {
        alert('No transactions to export')
        return
      }

      const exportData = data.map((t: any) => ({
        'Date': t.date,
        'Description': t.description,
        'Category': t.category,
        'Amount': t.amount,
        'Type': t.type,
        'Currency': t.currency,
        'Status': t.status,
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // Date
        { wch: 30 }, // Description
        { wch: 15 }, // Category
        { wch: 12 }, // Amount
        { wch: 10 }, // Type
        { wch: 10 }, // Currency
        { wch: 10 }, // Status
      ]
      ws['!cols'] = colWidths

      const fileName = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export transactions')
    }
  }

  // Share via WhatsApp (Premium feature - API validates premium status)
  const handleShareWhatsApp = async () => {
    try {
      const transactionIds = selectedRows.length > 0 ? selectedRows : undefined
      const { data, error } = await expensesApi.getShareData(transactionIds)

      if (error) {
        alert(error)
        return
      }

      if (!data) {
        alert('No data to share')
        return
      }

      // Create text summary
      let message = `*Transaction Summary*\n`
      message += `Date: ${new Date().toLocaleDateString()}\n\n`

      message += `Total Income: +${data.summary.totalIncome.toFixed(2)}\n`
      message += `Total Expense: -${data.summary.totalExpense.toFixed(2)}\n`
      message += `Net: ${data.summary.netBalance.toFixed(2)}\n\n`

      message += `*Transactions (${data.summary.count}):*\n`
      data.transactions.forEach((t: any, idx: number) => {
        const sign = t.amount >= 0 ? '+' : ''
        message += `${idx + 1}. ${t.description} | ${sign}${t.amount.toFixed(2)} | ${t.category}\n`
      })

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    } catch (err) {
      console.error('Share failed:', err)
      alert('Failed to prepare share data')
    }
  }

  // Voice input functions - using TTS service with cloud fallback
  const speak = (text: string, lang?: string): Promise<void> => {
    const targetLang = lang || voiceLanguage
    return ttsSpeak(text, targetLang, {
      useCloudFallback: true,
      onStart: () => console.log(`Speaking in ${targetLang}: ${text.substring(0, 50)}...`),
      onError: () => {}, // Silent error handling - TTS service logs internally
    }).catch(() => {}) // Silent catch - TTS is non-critical
  }

  // Speak and wait for completion before callback
  const speakAndWait = async (text: string, callback?: () => void) => {
    await speak(text)
    if (callback) callback()
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceMessage("Speech recognition not supported. Please use Chrome browser.")
      speak("Speech recognition is not supported in this browser. Please use Chrome.")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = voiceLanguage  // Use selected language for recognition

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceTranscript("")
      setVoiceMessage(t("listening"))
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim results
      if (interimTranscript) {
        setVoiceTranscript(interimTranscript)
      }

      // Process final result
      if (finalTranscript) {
        setVoiceTranscript(finalTranscript.toLowerCase())
        processVoiceInput(finalTranscript.toLowerCase())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      switch (event.error) {
        case 'no-speech':
          setVoiceMessage(t("noSpeech"))
          break
        case 'audio-capture':
          setVoiceMessage(t("noMic"))
          break
        case 'not-allowed':
          setVoiceMessage(t("micDenied"))
          break
        case 'network':
          setVoiceMessage(t("networkError"))
          break
        default:
          setVoiceMessage(t("couldntHear"))
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      setVoiceMessage(t("failedToStart"))
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const processVoiceInput = (transcript: string) => {
    setIsProcessingVoice(true)

    switch (voiceStep) {
      case "type":
        // Check for expense keywords in multiple languages
        const expenseKeywords = ["expense", "spent", "paid", "खर्च", "செலவு", "ఖర్చు", "gasto", "dépense", "ausgabe", "支出", "지출", "مصروف", "despesa", "расход"]
        const incomeKeywords = ["income", "received", "earned", "got", "आय", "வருமானம்", "ఆదాయం", "ingreso", "revenu", "einnahme", "收入", "수입", "دخل", "receita", "доход"]

        if (expenseKeywords.some(kw => transcript.includes(kw))) {
          setVoiceTransactionType("expense")
          setVoiceMessage(t("gotExpense"))
          speak(t("gotExpense") + " " + t("howMuchSpend"))
          setTimeout(() => {
            setVoiceStep("amount")
            setVoiceMessage(t("howMuchSpend"))
            setIsProcessingVoice(false)
          }, 1500)
        } else if (incomeKeywords.some(kw => transcript.includes(kw))) {
          setVoiceTransactionType("income")
          setVoiceMessage(t("gotIncome"))
          speak(t("gotIncome") + " " + t("howMuchReceive"))
          setTimeout(() => {
            setVoiceStep("amount")
            setVoiceMessage(t("howMuchReceive"))
            setIsProcessingVoice(false)
          }, 1500)
        } else {
          setVoiceMessage(t("sayExpenseOrIncome"))
          speak(t("didntCatchExpenseIncome"))
          setIsProcessingVoice(false)
        }
        break

      case "amount":
        // Extract numbers from transcript
        const numbers = transcript.match(/\d+\.?\d*/g)
        if (numbers && numbers.length > 0) {
          const amount = numbers[0]
          setVoiceAmount(amount)
          setVoiceMessage(`₹${amount}`)
          speak(t("gotAmount", { amount })).then(() => {
            // For income: ask who gave money, for expense: ask who you paid
            if (voiceTransactionType === "income") {
              setVoiceStep("payer")
              setVoiceMessage(t("whoGaveYouMoney"))
              speak(t("whoGaveYouMoney")).then(() => {
                setIsProcessingVoice(false)
              })
            } else {
              setVoiceStep("description")
              setVoiceMessage(t("whatWasThisFor"))
              speak(t("whatWasThisFor")).then(() => {
                setIsProcessingVoice(false)
              })
            }
          })
        } else {
          // Try to parse word numbers in multiple languages
          const wordNumbers: Record<string, string> = {
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
            'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
            'hundred': '100', 'thousand': '1000',
            // Hindi
            'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5',
            'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
            'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50', 'सौ': '100', 'हजार': '1000',
            // Spanish
            'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
            'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
            'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50', 'cien': '100', 'mil': '1000',
          }
          let foundAmount = ""
          for (const [word, num] of Object.entries(wordNumbers)) {
            if (transcript.includes(word)) {
              foundAmount = num
              break
            }
          }
          if (foundAmount) {
            setVoiceAmount(foundAmount)
            setVoiceMessage(`₹${foundAmount}`)
            speak(t("gotAmount", { amount: foundAmount })).then(() => {
              // For income: ask who gave money, for expense: ask who you paid
              if (voiceTransactionType === "income") {
                setVoiceStep("payer")
                setVoiceMessage(t("whoGaveYouMoney"))
                speak(t("whoGaveYouMoney")).then(() => {
                  setIsProcessingVoice(false)
                })
              } else {
                setVoiceStep("description")
                setVoiceMessage(t("whatWasThisFor"))
                speak(t("whatWasThisFor")).then(() => {
                  setIsProcessingVoice(false)
                })
              }
            })
          } else {
            setVoiceMessage(t("sayAmountClearly"))
            speak(t("didntCatchAmount"))
            setIsProcessingVoice(false)
          }
        }
        break

      case "payer":
        // For income: who gave the money
        if (transcript.length > 2) {
          const payer = transcript.charAt(0).toUpperCase() + transcript.slice(1)
          setVoicePayer(payer)
          setVoiceMessage(payer)
          speak(t("gotPayer", { payer })).then(() => {
            setVoiceStep("reason")
            setVoiceMessage(t("whyDidYouGetMoney"))
            speak(t("whyDidYouGetMoney")).then(() => {
              setIsProcessingVoice(false)
            })
          })
        } else {
          setVoiceMessage(t("whoGaveYouMoney"))
          speak(t("whoGaveYouMoney"))
          setIsProcessingVoice(false)
        }
        break

      case "reason":
        // For income: reason for getting money
        if (transcript.length > 2) {
          const reason = transcript.charAt(0).toUpperCase() + transcript.slice(1)
          setVoiceReason(reason)
          // Use payer + reason as description for income
          setVoiceDescription(`${voicePayer} - ${reason}`)
          setVoiceMessage(reason)
          speak(t("gotReason", { reason })).then(() => {
            setVoiceStep("category")
            setVoiceMessage(t("whatCategory"))
            speak(t("whatCategory")).then(() => {
              setIsProcessingVoice(false)
            })
          })
        } else {
          setVoiceMessage(t("whyDidYouGetMoney"))
          speak(t("whyDidYouGetMoney"))
          setIsProcessingVoice(false)
        }
        break

      case "description":
        if (transcript.length > 2) {
          const description = transcript.charAt(0).toUpperCase() + transcript.slice(1)
          setVoiceDescription(description)
          setVoiceMessage(description)
          speak(t("gotDescription", { description })).then(() => {
            setVoiceStep("category")
            setVoiceMessage(t("whatCategory"))
            speak(t("whatCategory")).then(() => {
              setIsProcessingVoice(false)
            })
          })
        } else {
          setVoiceMessage(t("describeTransaction"))
          speak(t("tellMeWhatFor"))
          setIsProcessingVoice(false)
        }
        break

      case "category":
        // Try to match with existing categories
        const categoryList = categoriesData as any[] || []
        let matchedCategory = categoryList.find((cat: any) =>
          transcript.includes(cat.name.toLowerCase())
        )

        if (!matchedCategory) {
          // Common category keywords
          const categoryKeywords: Record<string, string[]> = {
            'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'eat', 'restaurant', 'coffee', 'snack'],
            'Transportation': ['transport', 'uber', 'ola', 'cab', 'taxi', 'bus', 'train', 'petrol', 'fuel', 'travel'],
            'Shopping': ['shopping', 'amazon', 'flipkart', 'clothes', 'shoes', 'buy', 'purchase'],
            'Bills & Utilities': ['bill', 'electricity', 'water', 'gas', 'internet', 'phone', 'recharge'],
            'Entertainment': ['entertainment', 'movie', 'netflix', 'spotify', 'game', 'fun'],
            'Healthcare': ['health', 'medicine', 'doctor', 'hospital', 'medical', 'pharmacy'],
            'Groceries': ['grocery', 'vegetables', 'fruits', 'supermarket', 'bigbasket', 'blinkit'],
          }

          for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => transcript.includes(kw))) {
              matchedCategory = categoryList.find((cat: any) =>
                cat.name.toLowerCase().includes(category.toLowerCase().split(' ')[0])
              ) || { name: category, id: null }
              break
            }
          }
        }

        const categoryName = matchedCategory?.name || transcript.charAt(0).toUpperCase() + transcript.slice(1)
        setVoiceCategory(matchedCategory?.id || "")
        setVoiceCategoryName(categoryName)
        setVoiceMessage(categoryName)
        speak(t("gotCategory", { category: categoryName })).then(() => {
          setVoiceStep("payment")
          setVoiceMessage(t("whatPaymentMode"))
          speak(t("whatPaymentMode")).then(() => {
            setIsProcessingVoice(false)
          })
        })
        break

      case "payment":
        // Payment mode keywords
        const paymentKeywords: Record<string, string[]> = {
          'Cash': ['cash', 'नकद', 'ரொக்கம்', 'నగదు', 'efectivo', 'espèces', 'bargeld', '现金', '現金', '현금', 'نقد', 'dinheiro', 'наличные'],
          'UPI': ['upi', 'google pay', 'gpay', 'phonepe', 'paytm', 'bhim', 'యూపీఐ', 'యుపిఐ'],
          'Card': ['card', 'credit', 'debit', 'कार्ड', 'அட்டை', 'కార్డు', 'tarjeta', 'carte', 'karte', '卡', 'カード', '카드', 'بطاقة', 'cartão', 'карта'],
          'Bank Transfer': ['bank', 'transfer', 'neft', 'imps', 'rtgs', 'बैंक', 'வங்கி', 'బ్యాంకు', 'banco', 'banque', '银行', '銀行', '은행', 'بنك', 'банк'],
          'Wallet': ['wallet', 'वॉलेट', 'பணப்பை', 'వాలెట్', 'billetera', 'portefeuille', '钱包', 'ウォレット', '지갑', 'محفظة', 'carteira', 'кошелек'],
        }

        let matchedPayment = ""
        for (const [mode, keywords] of Object.entries(paymentKeywords)) {
          if (keywords.some(kw => transcript.toLowerCase().includes(kw.toLowerCase()))) {
            matchedPayment = mode
            break
          }
        }

        const paymentMode = matchedPayment || transcript.charAt(0).toUpperCase() + transcript.slice(1)
        setVoicePaymentMode(paymentMode)
        setVoiceMessage(paymentMode)
        speak(t("gotPaymentMode", { mode: paymentMode })).then(() => {
          setVoiceStep("confirm")
          setVoiceMessage(t("reviewAndSave"))
          setIsProcessingVoice(false)
        })
        break

      case "confirm":
        // Yes keywords in multiple languages
        const yesKeywords = ["yes", "save", "confirm", "ok", "हां", "हाँ", "ஆம்", "అవును", "sí", "si", "oui", "ja", "是", "예", "نعم", "sim", "да"]
        const noKeywords = ["no", "cancel", "नहीं", "இல்லை", "కాదు", "no", "non", "nein", "否", "아니오", "لا", "não", "нет"]

        if (yesKeywords.some(kw => transcript.includes(kw))) {
          setVoiceMessage(t("savingTransaction"))
          speak(t("saving"))
          saveVoiceTransaction()
        } else if (noKeywords.some(kw => transcript.includes(kw))) {
          setVoiceMessage(t("cancelled"))
          speak(t("cancelledMessage"))
          setTimeout(() => {
            resetVoiceState()
            setVoiceDialogOpen(false)
          }, 1500)
        } else {
          setVoiceMessage(t("confirmSave"))
          speak(t("confirmSaveSpeak"))
          setIsProcessingVoice(false)
        }
        break
    }
  }

  const saveVoiceTransaction = async () => {
    try {
      const amount = voiceTransactionType === "expense"
        ? -parseFloat(voiceAmount)
        : parseFloat(voiceAmount)

      const { error } = await expensesApi.create({
        amount,
        date: new Date().toISOString(),
        description: voiceDescription,
        merchant: voiceDescription,
        categoryId: voiceCategory || undefined,
        currency: "INR"
      })

      if (error) {
        setVoiceMessage(t("failedToSave"))
        speak(t("failedToSaveSpeak"))
      } else {
        // Deduct voice credits for non-premium users
        if (!isPremium) {
          setVoiceCredits(prev => Math.max(0, prev - VOICE_CREDIT_COST))
        }
        setVoiceStep("done")
        setVoiceMessage(t("savedSuccess"))
        speak(t("savedSuccess"))
        refetch()
        setTimeout(() => {
          resetVoiceState()
          setVoiceDialogOpen(false)
        }, 2000)
      }
    } catch (err) {
      setVoiceMessage(t("errorSaving"))
      speak(t("errorSpeak"))
    }
    setIsProcessingVoice(false)
  }

  const resetVoiceState = () => {
    setVoiceStep("language")
    setVoiceTransactionType("expense")
    setVoiceAmount("")
    setVoicePayer("")
    setVoiceReason("")
    setVoiceDescription("")
    setVoiceCategory("")
    setVoiceCategoryName("")
    setVoicePaymentMode("")
    setVoiceTranscript("")
    setVoiceMessage("Select your preferred language")
    setIsProcessingVoice(false)
    setIsListening(false)
    setVoiceLanguage("") // Reset language to empty
  }

  const startVoiceInput = async () => {
    // Check if microphone permission is granted
    if (micPermissionStatus === "denied") {
      setMicPermissionDialogOpen(true)
      return
    }

    if (micPermissionStatus === "prompt" || micPermissionStatus === "checking") {
      // Show permission dialog first
      setMicPermissionDialogOpen(true)
      return
    }

    // Permission granted, start voice input
    openVoiceDialog()
  }

  const openVoiceDialog = () => {
    // Check voice credits for non-premium users
    if (!isPremium && voiceCredits < VOICE_CREDIT_COST) {
      setPremiumFeature("voice")
      setPremiumDialogOpen(true)
      return
    }
    resetVoiceState()
    setVoiceDialogOpen(true)
    // Start at language selection step
    setVoiceStep("language")
    setVoiceMessage("Select your preferred language")
  }

  // Handle language selection and move to next step
  const handleVoiceLanguageSelect = async (lang: string) => {
    setVoiceLanguage(lang)
    cancelSpeech()

    const greetingConfig = audioGreetings[lang]

    // Try to play pre-recorded greeting audio first
    if (greetingConfig) {
      try {
        setVoiceMessage(greetingConfig.greeting)
        await playAudio(greetingConfig.audioFile)

        // After greeting, play expense/income question
        setTimeout(async () => {
          setVoiceStep("type")
          setVoiceMessage(greetingConfig.expenseOrIncome)
          try {
            await playAudio(greetingConfig.expenseOrIncomeAudio)
          } catch {
            // Fallback to TTS if audio fails
            ttsSpeak(greetingConfig.expenseOrIncome, lang, { useCloudFallback: true })
          }
        }, 300)
        return
      } catch (e) {
        console.log('Pre-recorded audio not available, using TTS:', e)
      }
    }

    // Fallback to TTS
    const greetingText = getVoiceText("languageGreeting", lang)
    setVoiceMessage(greetingText)
    ttsSpeak(greetingText, lang, {
      useCloudFallback: true,
      onEnd: () => {
        setTimeout(() => {
          setVoiceStep("type")
          setVoiceMessage(getVoiceText("expenseOrIncome", lang))
          ttsSpeak(getVoiceText("expenseOrIncome", lang), lang, { useCloudFallback: true })
        }, 500)
      },
    }).catch(() => {
      setTimeout(() => {
        setVoiceStep("type")
        setVoiceMessage(getVoiceText("expenseOrIncome", lang))
      }, 500)
    })
  }

  const handleAllowMicrophone = async () => {
    const granted = await requestMicrophonePermission()
    if (granted) {
      setMicPermissionDialogOpen(false)
      openVoiceDialog()
    }
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-400">Error loading transactions: {error}</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-3" />
          <h1 className="text-lg font-semibold">Transaction</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Transaction History</h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExportExcel}
                >
                  <IconDownload className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10"
                  onClick={handleShareWhatsApp}
                >
                  <IconBrandWhatsapp className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setAddNewOpen(true)}
                >
                  <IconPlus className="h-4 w-4" />
                  Add New
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setImportOpen(true)}
                >
                  <IconUpload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 hover:border-purple-500/50 hover:from-purple-500/30 hover:to-blue-500/30"
                  onClick={startVoiceInput}
                >
                  <IconMicrophone className="h-4 w-4 text-purple-400" />
                  Voice
                </Button>
              </div>
            </div>

            {/* Add New Transaction Dialog */}
            <Dialog open={addNewOpen} onOpenChange={setAddNewOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[500px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new transaction.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Upload Receipt */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Attach Receipt (optional)</label>
                    {newReceipt ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/20">
                        <img src={newReceipt} alt="Receipt preview" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white"
                            onClick={() => { setNewReceipt(""); setNewReceiptName(""); setNewReceiptFile(null) }}
                          >
                            <IconX className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                          {newReceiptName}
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="receipt-upload"
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_0_15px_rgba(192,192,192,0.3)]"
                      >
                        <IconUpload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleReceiptUpload(e, false)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Upload Error Display */}
                  {uploadError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm flex items-center gap-2">
                      <IconX className="h-4 w-4" />
                      {uploadError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Date</label>
                      <DatePicker />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="bg-white/5 border-white/10"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payee</label>
                      <Input
                        placeholder="e.g. Starbucks"
                        className="bg-white/5 border-white/10"
                        value={newPayee}
                        onChange={(e) => setNewPayee(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payment Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTransactionType("expense")}
                          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                            transactionType === "expense"
                              ? "bg-red-500 text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransactionType("income")}
                          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                            transactionType === "income"
                              ? "bg-green-500 text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          Income
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10">
                            {categories.find((c: { id: string; name: string }) => c.id === newCategory)?.name || "Select category"}
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                          <DropdownMenuRadioGroup value={newCategory} onValueChange={setNewCategory}>
                            {categories.length > 0 ? (
                              categories.map((cat: { id: string; name: string }) => (
                                <DropdownMenuRadioItem key={cat.id} value={cat.id}>{cat.name}</DropdownMenuRadioItem>
                              ))
                            ) : (
                              <>
                                <DropdownMenuRadioItem value="">No categories</DropdownMenuRadioItem>
                              </>
                            )}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payment Mode</label>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10">
                            {paymentType || "Select payment"}
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                          <DropdownMenuRadioGroup value={paymentType} onValueChange={setPaymentType}>
                            <DropdownMenuRadioItem value="Cash">Cash</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Credit Card">Credit Card</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Debit Card">Debit Card</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Bank Transfer">Bank Transfer</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="UPI">UPI</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Other">Other</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Interest Tags */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <IconTag className="h-4 w-4" />
                      Interest Tags (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_TAGS.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setNewInterestTags(prev =>
                              prev.includes(tag.id)
                                ? prev.filter(t => t !== tag.id)
                                : [...prev, tag.id]
                            )
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            newInterestTags.includes(tag.id)
                              ? `${tag.color} text-white shadow-lg`
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => { setAddNewOpen(false); resetAddForm() }}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90"
                      onClick={handleAddTransaction}
                      disabled={!newPayee || !newAmount}
                    >
                      Add Transaction
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Transaction Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[500px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Transaction</DialogTitle>
                  <DialogDescription>
                    Update the transaction details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Receipt Section */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Receipt Attachment</label>
                    {editReceipt ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/20">
                        <img src={getReceiptUrl(editReceipt) || editReceipt} alt="Receipt preview" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white"
                            onClick={() => handleViewReceipt(editReceipt)}
                          >
                            <IconPhoto className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white"
                            onClick={() => { setEditReceipt(""); setEditReceiptName(""); setEditReceiptFile(null) }}
                          >
                            <IconX className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="edit-receipt-upload"
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all"
                      >
                        <IconUpload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                        <input
                          id="edit-receipt-upload"
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleReceiptUpload(e, true)}
                        />
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Date</label>
                      <DatePicker />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="bg-white/5 border-white/10"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payee</label>
                      <Input
                        placeholder="e.g. Starbucks"
                        className="bg-white/5 border-white/10"
                        value={editPayee}
                        onChange={(e) => setEditPayee(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payment Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditTransactionType("expense")}
                          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                            editTransactionType === "expense"
                              ? "bg-red-500 text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTransactionType("income")}
                          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                            editTransactionType === "income"
                              ? "bg-green-500 text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          Income
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10">
                            {categories.find((c: { id: string; name: string }) => c.id === editCategory)?.name || "Select category"}
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                          <DropdownMenuRadioGroup value={editCategory} onValueChange={setEditCategory}>
                            {categories.length > 0 ? (
                              categories.map((cat: { id: string; name: string }) => (
                                <DropdownMenuRadioItem key={cat.id} value={cat.id}>{cat.name}</DropdownMenuRadioItem>
                              ))
                            ) : (
                              <>
                                <DropdownMenuRadioItem value="">No categories</DropdownMenuRadioItem>
                              </>
                            )}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Payment Mode</label>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10">
                            {editPaymentMode || "Select payment"}
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                          <DropdownMenuRadioGroup value={editPaymentMode} onValueChange={setEditPaymentMode}>
                            <DropdownMenuRadioItem value="Cash">Cash</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Credit Card">Credit Card</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Debit Card">Debit Card</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Bank Transfer">Bank Transfer</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="UPI">UPI</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Other">Other</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Interest Tags */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <IconTag className="h-4 w-4" />
                      Interest Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_TAGS.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setEditInterestTags(prev =>
                              prev.includes(tag.id)
                                ? prev.filter(t => t !== tag.id)
                                : [...prev, tag.id]
                            )
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            editInterestTags.includes(tag.id)
                              ? `${tag.color} text-white shadow-lg`
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleSaveEdit}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Receipt Dialog */}
            <Dialog open={receiptViewOpen} onOpenChange={setReceiptViewOpen}>
              <DialogContent className="bg-black border border-white/20 p-2 sm:max-w-[600px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader className="p-4">
                  <DialogTitle className="text-xl">Receipt</DialogTitle>
                </DialogHeader>
                <div className="p-2">
                  {viewingReceipt && (
                    <img src={viewingReceipt} alt="Receipt" className="w-full rounded-lg" />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Import Transaction Dialog */}
            <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) resetImportState() }}>
              <DialogContent className={`bg-black border border-white/20 p-6 rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)] ${importPreview && importPreview.length > 0 ? 'sm:max-w-[800px]' : 'sm:max-w-[500px]'}`}>
                <DialogHeader>
                  <DialogTitle className="text-xl">Import Transactions</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or Excel file to import transactions. The file should have columns for Date, Description/Name, and Amount.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Upload File</label>
                    {importFileName ? (
                      <div className="flex items-center justify-between p-4 border border-white/20 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <IconFileSpreadsheet className="h-5 w-5 text-green-400" />
                          <span className="text-sm font-medium">{importFileName}</span>
                          {importPreview && <span className="text-xs text-muted-foreground">({importPreview.length} transactions)</span>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setImportFile(null); setImportFileName(""); setImportError(""); setImportResult(null); setImportPreview(null) }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="import-file"
                        className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/20 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_0_15px_rgba(192,192,192,0.3)]"
                      >
                        <IconUpload className="h-10 w-10 text-muted-foreground" />
                        <div className="text-center">
                          <span className="text-sm font-medium">Click to upload</span>
                          <p className="text-xs text-muted-foreground mt-1">CSV, XLS, XLSX (max 10MB)</p>
                        </div>
                        <input
                          id="import-file"
                          type="file"
                          accept=".csv,.xls,.xlsx"
                          className="hidden"
                          onChange={handleImportFileChange}
                        />
                      </label>
                    )}
                  </div>

                  {/* Preview Loading */}
                  {isPreviewing && (
                    <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
                      <IconLoader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Parsing file...</span>
                    </div>
                  )}

                  {/* Preview Table */}
                  {importPreview && importPreview.length > 0 && !isPreviewing && (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Preview (first 10 rows)</label>
                      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                                {importPreview.some(t => t.category) && (
                                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.slice(0, 10).map((tx, idx) => (
                                <tr key={idx} className="border-t border-white/5">
                                  <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                                  <td className="px-3 py-2 text-xs">{tx.date}</td>
                                  <td className="px-3 py-2 text-xs truncate max-w-[200px]" title={tx.description || tx.merchant}>
                                    {tx.description || tx.merchant || '-'}
                                  </td>
                                  <td className={`px-3 py-2 text-xs text-right font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                  </td>
                                  {importPreview.some(t => t.category) && (
                                    <td className="px-3 py-2 text-xs text-muted-foreground">{tx.category || '-'}</td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {importPreview.length > 10 && (
                          <div className="px-3 py-2 bg-white/5 text-xs text-muted-foreground text-center border-t border-white/10">
                            ... and {importPreview.length - 10} more transactions
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {importError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm flex items-center gap-2">
                      <IconX className="h-4 w-4 flex-shrink-0" />
                      {importError}
                    </div>
                  )}

                  {/* Success Display */}
                  {importResult && (
                    <div className={`rounded-xl border p-3 text-sm ${
                      importResult.failed === 0
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <p>Successfully imported {importResult.success} transaction{importResult.success !== 1 ? 's' : ''}</p>
                      {importResult.failed > 0 && (
                        <p className="text-red-400 mt-1">Failed to import {importResult.failed} transaction{importResult.failed !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Import Options</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImportOption("replace")}
                        className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                          importOption === "replace"
                            ? "bg-white text-black"
                            : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        Replace All
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportOption("append")}
                        className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                          importOption === "append"
                            ? "bg-white text-black"
                            : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        Append
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {importOption === "replace"
                        ? "This will delete all existing transactions and replace them with imported data."
                        : "New transactions will be added to your existing data."}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => { setImportOpen(false); resetImportState() }}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90 disabled:opacity-50"
                      onClick={handleImport}
                      disabled={!importFile || isImporting || isPreviewing || !importPreview}
                    >
                      {isImporting ? (
                        <>
                          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        `Import ${importPreview ? importPreview.length : ''} Transactions`
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="relative w-80">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    className="pl-11 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DatePicker onDateChange={setFilterDate} selectedDate={filterDate} />
              </div>
              {selectedRows.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleEdit}
                    disabled={selectedRows.length !== 1}
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDelete}
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete ({selectedRows.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Transaction Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <IconFileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No transactions available</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {filterDate
                      ? `No transactions found for ${filterDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                      : 'No transactions found. Add a new transaction to get started.'}
                  </p>
                </div>
              ) : (
              <table className="w-full min-w-[900px]">
                {/* Table Header */}
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-4 py-4 text-left w-12">
                      <Checkbox
                        checked={selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-16">S.No</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">Payee</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-24">Amount</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-24">Type</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-32">Payment</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">Tags</th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-muted-foreground w-20">Receipt</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`hover:bg-white/5 ${
                        index !== filteredTransactions.length - 1 ? "border-b border-white/10" : ""
                      } ${selectedRows.includes(transaction.id) ? "bg-white/10" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedRows.includes(transaction.id)}
                          onCheckedChange={() => toggleRow(transaction.id)}
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-4 text-sm">{transaction.category}</td>
                      <td className="px-4 py-4 text-sm">{transaction.payee}</td>
                      <td className={`px-4 py-4 text-sm font-medium ${Number(transaction.amount) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {Number(transaction.amount) >= 0 ? "+" : ""}${Math.abs(Number(transaction.amount)).toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 text-sm ${transaction.type === "Income" ? "text-green-400" : "text-red-400"}`}>
                        {transaction.type}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{transaction.paymentMode}</td>
                      <td className="px-4 py-4">
                        {transaction.interestTags && transaction.interestTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {transaction.interestTags.slice(0, 2).map(tagId => {
                              const tag = INTEREST_TAGS.find(t => t.id === tagId)
                              return tag ? (
                                <span
                                  key={tagId}
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${tag.color} text-white`}
                                  title={tag.label}
                                >
                                  {tag.label}
                                </span>
                              ) : null
                            })}
                            {transaction.interestTags.length > 2 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground">
                                +{transaction.interestTags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {transaction.receipt ? (
                          <button
                            className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                            onClick={() => handleViewReceipt(transaction.receipt!)}
                            title="View receipt"
                          >
                            <IconPaperclip className="h-4 w-4 text-blue-400" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Premium Upgrade Dialog */}
      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent className="bg-black border border-white/20 p-0 sm:max-w-[420px] rounded-2xl shadow-[0_0_60px_rgba(234,179,8,0.3)] overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <IconCrown className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Upgrade to Premium
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm">
                  {premiumFeature === "transactions"
                    ? "You've used all your free transaction credits"
                    : premiumFeature === "import"
                    ? "You've used all your free import credits"
                    : premiumFeature === "export"
                    ? "You've used all your free export credits"
                    : premiumFeature === "voice"
                    ? "You've used all your free voice transaction credits"
                    : "You've used all your free share credits"}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Features list - compact */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: IconPlus, text: "Unlimited transactions", highlight: premiumFeature === "transactions" },
                { icon: IconUpload, text: "Unlimited imports", highlight: premiumFeature === "import" },
                { icon: IconDownload, text: "Unlimited exports", highlight: premiumFeature === "export" },
                { icon: IconBrandWhatsapp, text: "Unlimited shares", highlight: premiumFeature === "share" },
                { icon: IconMicrophone, text: "Unlimited voice transactions", highlight: premiumFeature === "voice" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    feature.highlight
                      ? "bg-yellow-500/20 border border-yellow-500/30"
                      : "bg-white/5"
                  }`}
                >
                  <feature.icon className={`h-4 w-4 ${feature.highlight ? "text-yellow-400" : "text-white/60"}`} />
                  <span className={feature.highlight ? "text-white font-medium" : "text-white/70"}>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing options - compact */}
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly Plan */}
              <button
                className={`p-3 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === "monthly"
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                }`}
                onClick={() => setSelectedPlan("monthly")}
              >
                {selectedPlan === "monthly" && (
                  <div className="absolute top-2 right-2">
                    <IconCheck className="h-4 w-4 text-purple-400" />
                  </div>
                )}
                <div className={`text-xs ${selectedPlan === "monthly" ? "text-purple-400" : "text-white/60"}`}>Monthly</div>
                <div className="text-xl font-bold text-white">₹99<span className="text-xs font-normal text-white/50">/mo</span></div>
              </button>

              {/* Yearly Plan */}
              <button
                className={`p-3 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === "yearly"
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                }`}
                onClick={() => setSelectedPlan("yearly")}
              >
                <div className="absolute -top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SAVE 17%
                </div>
                {selectedPlan === "yearly" && (
                  <div className="absolute top-2 right-2">
                    <IconCheck className="h-4 w-4 text-yellow-400" />
                  </div>
                )}
                <div className={`text-xs ${selectedPlan === "yearly" ? "text-yellow-400" : "text-white/60"}`}>Yearly</div>
                <div className="text-xl font-bold text-white">₹899<span className="text-xs font-normal text-white/50">/yr</span></div>
              </button>
            </div>

            {/* Payment methods - inline */}
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <span>Pay via</span>
              <span className="text-white/60">UPI</span>•
              <span className="text-white/60">Cards</span>•
              <span className="text-white/60">Net Banking</span>
            </div>

            {/* Upgrade Button */}
            <Button
              className="w-full py-3 font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl"
              onClick={() => {
                setPremiumDialogOpen(false)
                setShowStripeModal(true)
              }}
            >
              <IconCrown className="h-4 w-4 mr-2" />
              Pay ₹{selectedPlan === "monthly" ? "99" : "899"} - Upgrade Now
            </Button>

            <p className="text-center text-[11px] text-white/40">
              Cancel anytime • 7-day money-back guarantee
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Input Dialog */}
      <Dialog open={voiceDialogOpen} onOpenChange={(open) => {
        if (!open) {
          stopListening()
          window.speechSynthesis?.cancel()
          resetVoiceState()
        }
        setVoiceDialogOpen(open)
      }}>
        <DialogContent className="bg-black border border-white/20 p-0 sm:max-w-[400px] rounded-2xl shadow-[0_0_60px_rgba(147,51,234,0.3)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <IconMicrophone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Voice Transaction
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    Speak to add a transaction
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Steps - dynamic based on type */}
            <div className="flex justify-between items-center px-1">
              {(voiceTransactionType === "income"
                ? ["language", "type", "amount", "payer", "reason", "category", "payment", "confirm"]
                : ["language", "type", "amount", "description", "category", "payment", "confirm"]
              ).map((step, idx) => {
                const steps = voiceTransactionType === "income"
                  ? ["language", "type", "amount", "payer", "reason", "category", "payment", "confirm"]
                  : ["language", "type", "amount", "description", "category", "payment", "confirm"]
                const currentIdx = steps.indexOf(voiceStep)
                const isComplete = currentIdx > idx
                const isCurrent = voiceStep === step
                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-purple-500 text-white"
                        : isComplete
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-white/40"
                    }`}>
                      {isComplete ? "✓" : idx + 1}
                    </div>
                    {idx < 6 && <div className={`w-3 h-0.5 ${isComplete ? "bg-green-500" : "bg-white/10"}`} />}
                  </div>
                )
              })}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-[9px] text-white/40 px-0">
              <span>Lang</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Payee</span>
              <span>Category</span>
              <span>Payment</span>
              <span>Save</span>
            </div>

            {/* Current Question/Message */}
            <div className="text-center py-2">
              <p className="text-lg text-white font-medium">{voiceMessage || "Click the mic to start"}</p>
              {voiceTranscript && voiceStep !== "confirm" && (
                <p className="text-sm text-white/50 mt-2">You said: "{voiceTranscript}"</p>
              )}
            </div>

            {/* Mini Summary (during steps) */}
            {(voiceAmount || voiceDescription) && !["confirm", "done"].includes(voiceStep) && (
              <div className="bg-white/5 rounded-lg p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded ${voiceTransactionType === "expense" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {voiceTransactionType === "expense" ? "Expense" : "Income"}
                  </span>
                  {voiceAmount && <span className="px-2 py-1 rounded bg-white/10 text-white">₹{voiceAmount}</span>}
                  {voiceDescription && <span className="px-2 py-1 rounded bg-white/10 text-white">{voiceDescription}</span>}
                  {voiceCategoryName && <span className="px-2 py-1 rounded bg-white/10 text-white">{voiceCategoryName}</span>}
                  {voicePaymentMode && <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">{voicePaymentMode}</span>}
                </div>
              </div>
            )}

            {/* Confirm Step (Step 7) - Review & Save combined */}
            {voiceStep === "confirm" && !isProcessingVoice && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider text-center">Review Transaction</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60">Type</span>
                      <span className={`font-medium ${voiceTransactionType === "expense" ? "text-red-400" : "text-green-400"}`}>
                        {voiceTransactionType === "expense" ? "Expense" : "Income"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60">Amount</span>
                      <span className="text-lg font-bold text-white">₹{voiceAmount}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60">Payee</span>
                      <span className="text-white">{voiceDescription}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60">Category</span>
                      <span className="text-white">{voiceCategoryName || "Other"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/60">Payment</span>
                      <span className="text-purple-400">{voicePaymentMode || "Cash"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setVoiceTranscript("yes")
                      processVoiceInput("yes")
                    }}
                    className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">✓</span> Save
                  </button>
                  <button
                    onClick={() => {
                      setVoiceTranscript("no")
                      processVoiceInput("no")
                    }}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {voiceStep === "done" && (
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <p className="text-xl text-green-400 font-medium">Transaction Saved!</p>
                <p className="text-white/50 text-sm mt-2">
                  {voiceTransactionType === "expense" ? "-" : "+"}₹{voiceAmount} • {voiceDescription}
                </p>
              </div>
            )}

            {/* Language Selection (Step 1) */}
            {voiceStep === "language" && (
              <div className="space-y-2">
                <p className="text-center text-white/60 text-sm">Choose your preferred language</p>
                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto px-1">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleVoiceLanguageSelect(lang.code)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        voiceLanguage === lang.code
                          ? "bg-purple-500/30 border-purple-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <div className="text-left">
                        <p className="text-xs text-white font-medium">{lang.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type Selection with Voice + Buttons (Step 2) */}
            {voiceStep === "type" && !isProcessingVoice && (
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setVoiceTranscript("expense")
                      processVoiceInput("expense")
                    }}
                    className="flex-1 py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-lg font-medium"
                  >
                    💸 Expense
                  </button>
                  <button
                    onClick={() => {
                      setVoiceTranscript("income")
                      processVoiceInput("income")
                    }}
                    className="flex-1 py-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all text-lg font-medium"
                  >
                    💰 Income
                  </button>
                </div>
                <div className="text-center text-white/40 text-sm">or</div>
                <div className="flex justify-center">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-red-500 animate-pulse"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    }`}
                  >
                    {isListening ? (
                      <IconPlayerStop className="h-6 w-6 text-white" />
                    ) : (
                      <IconMicrophone className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-white/40">
                  {isListening ? t("sayExpenseIncome") : t("tapMicSay")}
                </p>
              </div>
            )}

            {/* Microphone Button (Steps 3-6: Amount, Description, Category, Payment) */}
            {["amount", "payer", "reason", "description", "category", "payment"].includes(voiceStep) && !isProcessingVoice && (
              <div className="flex justify-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessingVoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 animate-pulse"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  }`}
                >
                  {isListening ? (
                    <IconPlayerStop className="h-8 w-8 text-white" />
                  ) : (
                    <IconMicrophone className="h-8 w-8 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessingVoice && (
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <IconLoader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
            )}

            {/* Text Input Fallback */}
            {voiceStep !== "done" && voiceStep !== "type" && voiceStep !== "confirm" && !isListening && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      voiceStep === "amount" ? "Enter amount (e.g., 500)" :
                      voiceStep === "payer" ? "Enter who gave you money" :
                      voiceStep === "reason" ? "Enter reason for income" :
                      voiceStep === "description" ? "Enter payee name" :
                      voiceStep === "category" ? "Enter category" :
                      voiceStep === "payment" ? "Enter payment mode (Cash, UPI, Card)" : ""
                    }
                    className="bg-white/5 border-white/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value
                        if (value) {
                          setVoiceTranscript(value.toLowerCase())
                          processVoiceInput(value.toLowerCase())
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                      if (input?.value) {
                        setVoiceTranscript(input.value.toLowerCase())
                        processVoiceInput(input.value.toLowerCase())
                        input.value = ""
                      }
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}

            {/* Helper Text */}
            <p className="text-center text-xs text-white/40">
              {isListening ? "Listening... Speak now" :
               voiceStep === "done" ? "" :
               voiceStep === "language" ? "Select a language to continue" :
               voiceStep === "type" ? "Choose expense or income" :
               voiceStep === "confirm" ? "Confirm to save your transaction" :
               "Tap the microphone and speak, or type below"}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Microphone Permission Dialog */}
      <Dialog open={micPermissionDialogOpen} onOpenChange={setMicPermissionDialogOpen}>
        <DialogContent className="bg-black border border-white/20 p-0 sm:max-w-[400px] rounded-2xl shadow-[0_0_60px_rgba(147,51,234,0.3)] overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                micPermissionStatus === "denied"
                  ? "bg-red-500/20"
                  : "bg-purple-500/20"
              }`}>
                <IconMicrophone className={`h-10 w-10 ${
                  micPermissionStatus === "denied"
                    ? "text-red-400"
                    : "text-purple-400"
                }`} />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <DialogTitle className="text-xl font-bold text-white">
                {micPermissionStatus === "denied"
                  ? "Microphone Access Blocked"
                  : "Enable Microphone"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {micPermissionStatus === "denied"
                  ? "You've blocked microphone access. Please enable it in your browser settings to use voice input."
                  : "Voxa needs access to your microphone to add transactions using your voice."}
              </DialogDescription>
            </div>

            {/* Permission Status Indicator */}
            {micPermissionStatus === "denied" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-red-400 text-center">
                  🔒 Microphone is currently blocked
                </p>
                <p className="text-xs text-white/50 text-center mt-2">
                  Click the 🔒 icon in your browser's address bar → Site settings → Allow Microphone
                </p>
              </div>
            )}

            {/* Features List */}
            {micPermissionStatus !== "denied" && (
              <div className="space-y-3">
                <p className="text-xs text-white/50 uppercase tracking-wider text-center">What you can do with voice:</p>
                <div className="grid gap-2">
                  {[
                    "Say 'expense' or 'income' to set type",
                    "Speak the amount like '500 rupees'",
                    "Describe what the transaction was for",
                    "Confirm with 'yes' to save"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-purple-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {micPermissionStatus === "denied" ? (
                <>
                  <Button
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => {
                      // Try to open browser settings (works in some browsers)
                      window.open('chrome://settings/content/microphone', '_blank')
                    }}
                  >
                    Open Browser Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-3"
                    onClick={() => {
                      setMicPermissionDialogOpen(false)
                      // Still allow opening voice dialog for manual input
                      openVoiceDialog()
                    }}
                  >
                    Continue Without Voice
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    onClick={handleAllowMicrophone}
                  >
                    <IconMicrophone className="h-4 w-4 mr-2" />
                    Allow Microphone
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-3"
                    onClick={() => {
                      setMicPermissionDialogOpen(false)
                      openVoiceDialog()
                    }}
                  >
                    Skip for Now (Use Text Input)
                  </Button>
                </>
              )}
            </div>

            {/* Privacy Note */}
            <p className="text-center text-xs text-white/40">
              🔒 Your voice data is processed locally and never stored
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voxa AI Assistant */}
      <VoxaAI
        context={{
          transactions: transactions,
          totalIncome: transactions.filter(t => Number(t.amount) >= 0).reduce((sum, t) => sum + Number(t.amount), 0),
          totalExpense: transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
        }}
      />

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        amount={selectedPlan === "monthly" ? 99 : 899}
        plan={selectedPlan}
        planName={`Voxa Premium - ${selectedPlan === "monthly" ? "Monthly" : "Yearly"} Plan`}
        onSuccess={() => {
          setShowStripeModal(false)
          // Refresh to update premium status
          window.location.reload()
        }}
        onError={(error) => {
          console.error("Payment error:", error)
        }}
      />
    </div>
  )
}
