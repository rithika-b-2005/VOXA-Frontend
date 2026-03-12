"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { IconPlus, IconSearch, IconTrash, IconEdit, IconTarget, IconTrendingUp, IconLoader2, IconAlertTriangle, IconCalendar } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategories, useExpenseStats } from "@/hooks/useApi"
import { categoriesApi, budgetsApi, BudgetStatus } from "@/lib/api"

interface Category {
  id: string
  name: string
  icon: string
  color: string
  transactions: number
  spent: number
  budget: number
  budgetId?: string
  budgetPeriod?: string
  budgetStatus?: 'GOOD' | 'WARNING' | 'CRITICAL' | 'EXCEEDED'
  daysRemaining?: number
}

const colorOptions = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b",
  "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#f97316"
]

const periodOptions = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" }
]

export default function CategoriesPage() {
  const { data: categoriesData, loading, error, refetch } = useCategories()
  const { data: statsData } = useExpenseStats()
  const [budgetStatus, setBudgetStatus] = React.useState<{ budgets: BudgetStatus[], overall: { totalBudget: number, totalSpent: number, percentage: number } } | null>(null)
  const [budgetLoading, setBudgetLoading] = React.useState(true)
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch budget status
  const fetchBudgetStatus = React.useCallback(async () => {
    setBudgetLoading(true)
    try {
      const { data, error } = await budgetsApi.getStatus()
      if (!error && data) {
        setBudgetStatus(data)
      }
    } catch (err) {
      console.error("Failed to fetch budget status:", err)
    } finally {
      setBudgetLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchBudgetStatus()
  }, [fetchBudgetStatus])

  // Transform API data to Category format with budget info
  const categories: Category[] = React.useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return []
    return (categoriesData as any[]).map((cat: any, index: number) => {
      const categoryStats = (statsData as any)?.byCategory?.find((s: any) => s.categoryId === cat.id)
      const categoryBudget = budgetStatus?.budgets?.find((b: BudgetStatus) => b.categoryId === cat.id)

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon || "📁",
        color: cat.color || colorOptions[index % colorOptions.length],
        transactions: cat._count?.expenses || 0,
        spent: categoryBudget?.spent || Math.abs(categoryStats?._sum?.amount || 0),
        budget: categoryBudget?.limit || 0,
        budgetId: categoryBudget?.id,
        budgetPeriod: categoryBudget?.period,
        budgetStatus: categoryBudget?.status,
        daysRemaining: categoryBudget?.daysRemaining
      }
    })
  }, [categoriesData, statsData, budgetStatus])

  const [addNewOpen, setAddNewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [budgetOpen, setBudgetOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [newCategoryBudget, setNewCategoryBudget] = React.useState("")
  const [newCategoryColor, setNewCategoryColor] = React.useState("#22c55e")
  const [newCategoryPeriod, setNewCategoryPeriod] = React.useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY")

  const [editCategoryName, setEditCategoryName] = React.useState("")
  const [editCategoryColor, setEditCategoryColor] = React.useState("")
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)

  const [budgetCategoryId, setBudgetCategoryId] = React.useState<string | null>(null)
  const [budgetCategoryName, setBudgetCategoryName] = React.useState("")
  const [budgetAmount, setBudgetAmount] = React.useState("")
  const [budgetPeriod, setBudgetPeriod] = React.useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY")
  const [budgetAlertAt50, setBudgetAlertAt50] = React.useState(true)
  const [budgetAlertAt80, setBudgetAlertAt80] = React.useState(true)
  const [budgetAlertAt100, setBudgetAlertAt100] = React.useState(true)
  const [existingBudgetId, setExistingBudgetId] = React.useState<string | null>(null)

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === filteredCategories.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredCategories.map(c => c.id))
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await Promise.all(selectedRows.map(id => categoriesApi.delete(id)))
      setSelectedRows([])
      refetch()
      fetchBudgetStatus()
    } catch (err) {
      console.error("Failed to delete categories:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const category = categories.find(c => c.id === selectedRows[0])
      if (category) {
        setEditingCategoryId(category.id)
        setEditCategoryName(category.name)
        setEditCategoryColor(category.color)
        setEditOpen(true)
      }
    }
  }

  const handleAddCategory = async () => {
    setIsSubmitting(true)
    try {
      const { data: newCategory, error } = await categoriesApi.create({
        name: newCategoryName,
        color: newCategoryColor,
        description: ""
      })

      if (error) {
        console.error("Failed to create category:", error)
      } else {
        // If budget is specified, create budget for the new category
        if (newCategoryBudget && parseFloat(newCategoryBudget) > 0 && newCategory) {
          await budgetsApi.create({
            amount: parseFloat(newCategoryBudget),
            categoryId: (newCategory as any).id,
            period: newCategoryPeriod,
            alertAt50: true,
            alertAt80: true,
            alertAt100: true
          })
        }

        setAddNewOpen(false)
        setNewCategoryName("")
        setNewCategoryBudget("")
        setNewCategoryColor("#22c55e")
        setNewCategoryPeriod("MONTHLY")
        refetch()
        fetchBudgetStatus()
      }
    } catch (err) {
      console.error("Failed to create category:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingCategoryId) return
    setIsSubmitting(true)
    try {
      const { error } = await categoriesApi.update(editingCategoryId, {
        name: editCategoryName,
        color: editCategoryColor
      })
      if (error) {
        console.error("Failed to update category:", error)
      } else {
        setEditOpen(false)
        setSelectedRows([])
        setEditingCategoryId(null)
        refetch()
      }
    } catch (err) {
      console.error("Failed to update category:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetBudget = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      setBudgetCategoryId(categoryId)
      setBudgetCategoryName(category.name)
      setBudgetAmount(category.budget > 0 ? category.budget.toString() : "")
      setBudgetPeriod((category.budgetPeriod as "WEEKLY" | "MONTHLY" | "YEARLY") || "MONTHLY")
      setExistingBudgetId(category.budgetId || null)
      setBudgetAlertAt50(true)
      setBudgetAlertAt80(true)
      setBudgetAlertAt100(true)
      setBudgetOpen(true)
    }
  }

  const handleSaveBudget = async () => {
    if (!budgetCategoryId) return
    setIsSubmitting(true)

    try {
      const amount = parseFloat(budgetAmount)
      if (isNaN(amount) || amount <= 0) {
        // If amount is invalid or zero, delete existing budget
        if (existingBudgetId) {
          await budgetsApi.delete(existingBudgetId)
        }
      } else if (existingBudgetId) {
        // Update existing budget
        await budgetsApi.update(existingBudgetId, {
          amount,
          period: budgetPeriod,
          alertAt50: budgetAlertAt50,
          alertAt80: budgetAlertAt80,
          alertAt100: budgetAlertAt100
        })
      } else {
        // Create new budget
        await budgetsApi.create({
          amount,
          categoryId: budgetCategoryId,
          period: budgetPeriod,
          alertAt50: budgetAlertAt50,
          alertAt80: budgetAlertAt80,
          alertAt100: budgetAlertAt100
        })
      }

      setBudgetOpen(false)
      setBudgetCategoryId(null)
      setBudgetAmount("")
      setExistingBudgetId(null)
      fetchBudgetStatus()
    } catch (err) {
      console.error("Failed to save budget:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBudget = budgetStatus?.overall?.totalBudget || 0
  const totalSpent = budgetStatus?.overall?.totalSpent || 0
  const overallPercentage = budgetStatus?.overall?.percentage || 0

  // Count categories with exceeded budgets
  const exceededCount = categories.filter(c => c.budgetStatus === 'EXCEEDED').length
  const warningCount = categories.filter(c => c.budgetStatus === 'WARNING' || c.budgetStatus === 'CRITICAL').length

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading categories...</p>
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
            <p className="text-red-400">Error loading categories: {error}</p>
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
          <h1 className="text-lg font-semibold">Categories & Budgets</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <IconTarget className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Budget</span>
                </div>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {categories.filter(c => c.budget > 0).length} categories with budgets
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <IconTrendingUp className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                </div>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallPercentage.toFixed(1)}% of total budget
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${totalBudget - totalSpent >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <IconTarget className={`h-5 w-5 ${totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">Remaining</span>
                </div>
                <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(totalBudget - totalSpent).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalBudget - totalSpent >= 0 ? 'Under budget' : 'Over budget'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${exceededCount > 0 ? 'bg-red-500/20' : warningCount > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                    <IconAlertTriangle className={`h-5 w-5 ${exceededCount > 0 ? 'text-red-400' : warningCount > 0 ? 'text-yellow-400' : 'text-green-400'}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">Alerts</span>
                </div>
                <p className={`text-2xl font-bold ${exceededCount > 0 ? 'text-red-400' : warningCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {exceededCount > 0 ? `${exceededCount} Exceeded` : warningCount > 0 ? `${warningCount} Warning` : 'All Good'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Budget health status
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Category List</h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddNewOpen(true)}>
                  <IconPlus className="h-4 w-4" />
                  Add New
                </Button>
              </div>
            </div>

            {/* Add New Category Dialog */}
            <Dialog open={addNewOpen} onOpenChange={setAddNewOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[450px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category with an optional budget limit.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input
                      placeholder="e.g. Groceries"
                      className="bg-white/5 border-white/10"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${newCategoryColor === color ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Budget (Optional)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 500"
                        className="bg-white/5 border-white/10"
                        value={newCategoryBudget}
                        onChange={(e) => setNewCategoryBudget(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Period</label>
                      <select
                        className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm"
                        value={newCategoryPeriod}
                        onChange={(e) => setNewCategoryPeriod(e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY")}
                      >
                        {periodOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => setAddNewOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90"
                      onClick={handleAddCategory}
                      disabled={!newCategoryName || isSubmitting}
                    >
                      {isSubmitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Add Category"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[400px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Category</DialogTitle>
                  <DialogDescription>
                    Update the category name and color.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input
                      placeholder="e.g. Groceries"
                      className="bg-white/5 border-white/10"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${editCategoryColor === color ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditCategoryColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={handleSaveEdit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Set Budget Dialog */}
            <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[450px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {existingBudgetId ? 'Edit Budget' : 'Set Budget'} - {budgetCategoryName}
                  </DialogTitle>
                  <DialogDescription>
                    Configure budget limit and alert thresholds for this category.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Budget Amount ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 500"
                        className="bg-white/5 border-white/10"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Period</label>
                      <select
                        className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm"
                        value={budgetPeriod}
                        onChange={(e) => setBudgetPeriod(e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY")}
                      >
                        {periodOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 mt-2">
                    <label className="text-sm font-medium">Alert Thresholds</label>
                    <div className="flex flex-col gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={budgetAlertAt50}
                          onCheckedChange={(checked) => setBudgetAlertAt50(checked as boolean)}
                        />
                        <span className="text-sm">Alert at 50% - <span className="text-muted-foreground">Early warning</span></span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={budgetAlertAt80}
                          onCheckedChange={(checked) => setBudgetAlertAt80(checked as boolean)}
                        />
                        <span className="text-sm">Alert at 80% - <span className="text-yellow-400">Warning</span></span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={budgetAlertAt100}
                          onCheckedChange={(checked) => setBudgetAlertAt100(checked as boolean)}
                        />
                        <span className="text-sm">Alert at 100% - <span className="text-red-400">Budget exceeded</span></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 shadow-[0_0_15px_rgba(192,192,192,0.3)]" onClick={() => setBudgetOpen(false)}>
                      Cancel
                    </Button>
                    {existingBudgetId && (
                      <Button
                        variant="destructive"
                        className="px-4"
                        onClick={async () => {
                          setIsSubmitting(true)
                          try {
                            await budgetsApi.delete(existingBudgetId)
                            setBudgetOpen(false)
                            fetchBudgetStatus()
                          } catch (err) {
                            console.error("Failed to delete budget:", err)
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90"
                      onClick={handleSaveBudget}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Save Budget"}
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
                    placeholder="Search categories..."
                    className="pl-11 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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

            {/* Categories Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_50px_1fr_120px_180px_200px_100px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedRows.length === filteredCategories.length && filteredCategories.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </div>
                <div className="text-sm font-medium text-muted-foreground">S.No</div>
                <div className="text-sm font-medium text-muted-foreground">Category Name</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Period</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Budget</div>
                <div className="text-sm font-medium text-muted-foreground">Progress</div>
                <div className="text-sm font-medium text-muted-foreground text-right">Action</div>
              </div>

              {/* Table Rows */}
              {filteredCategories.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No categories found. Create your first category to get started.
                </div>
              ) : (
                filteredCategories.map((category, index) => {
                  const percentage = category.budget > 0 ? Math.min((category.spent / category.budget) * 100, 100) : 0
                  const isOver = category.spent > category.budget && category.budget > 0
                  const statusColor = category.budgetStatus === 'EXCEEDED' ? 'text-red-400'
                    : category.budgetStatus === 'CRITICAL' ? 'text-orange-400'
                    : category.budgetStatus === 'WARNING' ? 'text-yellow-400'
                    : 'text-green-400'

                  return (
                    <div
                      key={category.id}
                      className={`grid grid-cols-[40px_50px_1fr_120px_180px_200px_100px] gap-4 px-6 py-4 items-center hover:bg-white/5 ${
                        index !== filteredCategories.length - 1 ? "border-b border-white/10" : ""
                      } ${selectedRows.includes(category.id) ? "bg-white/10" : ""}`}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedRows.includes(category.id)}
                          onCheckedChange={() => toggleRow(category.id)}
                        />
                      </div>
                      <div className="text-sm">{index + 1}</div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                        {category.budgetStatus === 'EXCEEDED' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Over</span>
                        )}
                      </div>
                      <div className="text-sm text-center text-muted-foreground">
                        {category.budgetPeriod ? (
                          <span className="flex items-center justify-center gap-1">
                            <IconCalendar className="h-3 w-3" />
                            {category.budgetPeriod.charAt(0) + category.budgetPeriod.slice(1).toLowerCase()}
                          </span>
                        ) : '—'}
                      </div>
                      <div className="text-sm text-center">
                        {category.budget > 0 ? (
                          <span className={isOver ? 'text-red-400' : ''}>
                            ${category.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${category.budget.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No budget</span>
                        )}
                      </div>
                      <div>
                        {category.budget > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : ''}`}
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: isOver ? undefined : category.color
                                }}
                              />
                            </div>
                            <span className={`text-xs w-10 ${statusColor}`}>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSetBudget(category.id)}
                        >
                          <IconTarget className="h-3 w-3 mr-1" />
                          {category.budget > 0 ? 'Edit' : 'Set'}
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
