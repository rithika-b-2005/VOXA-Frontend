"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconReceipt2,
  IconChevronDown,
  IconCalculator,
  IconPigMoney,
  IconAlertTriangle,
  IconInfoCircle,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconCheck,
  IconPlus,
  IconTrash,
  IconDownload,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react"
import { useAuth } from "@/contexts/AuthContext"
import { taxEstimationApi } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface TaxBracket {
  min: number
  max: number
  rate: number
}

interface Deduction {
  id: string
  name: string
  amount: number
  category: string
}

interface TaxCalculation {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  federalTax: number
  totalCredits: number
  taxAfterCredits: number
  estimatedStateTax: number
  ficaTax: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  takeHomePay: number
  monthlyTakeHome: number
  bracketBreakdown: { bracket: string; amount: number; tax: number }[]
}

interface SavedEstimate {
  id: string
  name: string
  createdAt: string
  income: number
  takeHomePay: number
}

const DEDUCTION_CATEGORIES = [
  "Mortgage Interest",
  "State & Local Taxes (SALT)",
  "Charitable Contributions",
  "Medical Expenses",
  "Student Loan Interest",
  "Business Expenses",
  "Home Office",
  "Education Expenses",
  "Other",
]

export default function TaxEstimationPage() {
  const { user } = useAuth()

  // Form states
  const [annualIncome, setAnnualIncome] = React.useState<string>("")
  const [filingStatus, setFilingStatus] = React.useState<"single" | "married" | "headOfHousehold">("single")
  const [deductionType, setDeductionType] = React.useState<"standard" | "itemized">("standard")
  const [deductions, setDeductions] = React.useState<Deduction[]>([])
  const [newDeductionName, setNewDeductionName] = React.useState("")
  const [newDeductionAmount, setNewDeductionAmount] = React.useState("")
  const [newDeductionCategory, setNewDeductionCategory] = React.useState(DEDUCTION_CATEGORIES[0])
  const [showAddDeduction, setShowAddDeduction] = React.useState(false)

  // Tax credits
  const [childTaxCredit, setChildTaxCredit] = React.useState<number>(0)
  const [earnedIncomeCredit, setEarnedIncomeCredit] = React.useState<number>(0)
  const [otherCredits, setOtherCredits] = React.useState<number>(0)

  // API states
  const [taxBrackets, setTaxBrackets] = React.useState<{ single: TaxBracket[]; married: TaxBracket[] } | null>(null)
  const [standardDeductions, setStandardDeductions] = React.useState<{ single: number; married: number; headOfHousehold: number } | null>(null)
  const [taxCalculation, setTaxCalculation] = React.useState<TaxCalculation | null>(null)
  const [savedEstimates, setSavedEstimates] = React.useState<SavedEstimate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [calculating, setCalculating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Fetch tax brackets and saved estimates on mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [bracketsRes, deductionsRes, estimatesRes] = await Promise.all([
          taxEstimationApi.getBrackets(),
          taxEstimationApi.getDeductions(),
          taxEstimationApi.getSavedEstimates(),
        ])

        if (bracketsRes.data) {
          setTaxBrackets(bracketsRes.data)
        }
        if (deductionsRes.data) {
          setStandardDeductions(deductionsRes.data)
        }
        if (estimatesRes.data) {
          setSavedEstimates(estimatesRes.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch tax data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate tax when inputs change
  const handleCalculate = React.useCallback(async () => {
    const income = parseFloat(annualIncome) || 0
    if (income === 0) {
      setTaxCalculation(null)
      return
    }

    setCalculating(true)
    try {
      const { data, error } = await taxEstimationApi.calculate({
        income,
        filingStatus,
        deductionType,
        itemizedDeductions: deductionType === "itemized" ? deductions.map(d => ({ name: d.name, amount: d.amount, category: d.category })) : undefined,
        credits: {
          childTaxCredit,
          earnedIncomeCredit,
          otherCredits,
        },
      })

      if (data) {
        setTaxCalculation(data)
      }
    } catch (err) {
      console.error('Failed to calculate tax:', err)
    } finally {
      setCalculating(false)
    }
  }, [annualIncome, filingStatus, deductionType, deductions, childTaxCredit, earnedIncomeCredit, otherCredits])

  // Auto-calculate when inputs change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate()
    }, 500)
    return () => clearTimeout(timer)
  }, [handleCalculate])

  const handleSaveEstimate = async () => {
    if (!taxCalculation) return

    setSaving(true)
    try {
      const { data } = await taxEstimationApi.saveEstimate({
        name: `Tax Estimate - ${new Date().toLocaleDateString()}`,
        income: parseFloat(annualIncome) || 0,
        filingStatus,
        deductionType,
        itemizedDeductions: deductionType === "itemized" ? deductions : undefined,
        credits: { childTaxCredit, earnedIncomeCredit, otherCredits },
        calculation: taxCalculation,
      })

      if (data) {
        setSavedEstimates(prev => [data, ...prev])
      }
    } catch (err) {
      console.error('Failed to save estimate:', err)
    } finally {
      setSaving(false)
    }
  }

  const addDeduction = () => {
    if (!newDeductionName || !newDeductionAmount) return

    setDeductions(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newDeductionName,
        amount: parseFloat(newDeductionAmount) || 0,
        category: newDeductionCategory,
      }
    ])
    setNewDeductionName("")
    setNewDeductionAmount("")
    setShowAddDeduction(false)
  }

  const removeDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id))
  }

  // Get standard deduction based on filing status
  const getStandardDeduction = () => {
    if (standardDeductions) {
      return standardDeductions[filingStatus] || 0
    }
    // Fallback to 2024 values
    const defaults = { single: 14600, married: 29200, headOfHousehold: 21900 }
    return defaults[filingStatus]
  }

  // Pie chart data
  const pieData = taxCalculation ? [
    { name: "Take Home", value: taxCalculation.takeHomePay, color: "#22c55e" },
    { name: "Federal Tax", value: taxCalculation.taxAfterCredits, color: "#3b82f6" },
    { name: "State Tax", value: taxCalculation.estimatedStateTax, color: "#8b5cf6" },
    { name: "FICA", value: taxCalculation.ficaTax, color: "#f59e0b" },
  ] : []

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">Tax Estimation</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-lg font-semibold">Tax Estimation</h1>
          {taxCalculation && (
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveEstimate}
                disabled={saving}
              >
                {saving ? (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                )}
                Save Estimate
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Disclaimer */}
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <IconAlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Disclaimer</p>
                <p className="text-sm text-muted-foreground">
                  This is an estimate only and should not be considered tax advice. Consult a qualified tax professional for accurate tax planning.
                  Based on 2024 federal tax brackets.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Income Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <IconTrendingUp className="h-5 w-5 text-green-400" />
                  Income Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Annual Gross Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="75,000"
                        className="pl-7 bg-white/5 border-white/10"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Filing Status</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {filingStatus === "single" ? "Single" :
                           filingStatus === "married" ? "Married Filing Jointly" : "Head of Household"}
                          <IconChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[250px]">
                        <DropdownMenuRadioGroup value={filingStatus} onValueChange={(v) => setFilingStatus(v as any)}>
                          <DropdownMenuRadioItem value="single">Single</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="married">Married Filing Jointly</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="headOfHousehold">Head of Household</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <IconTrendingDown className="h-5 w-5 text-blue-400" />
                  Deductions
                </h3>

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setDeductionType("standard")}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      deductionType === "standard"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-medium">Standard Deduction</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${getStandardDeduction().toLocaleString()}
                    </p>
                  </button>

                  <button
                    onClick={() => setDeductionType("itemized")}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      deductionType === "itemized"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-medium">Itemized Deductions</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </p>
                  </button>
                </div>

                {deductionType === "itemized" && (
                  <div className="space-y-3">
                    {deductions.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${d.amount.toLocaleString()}</span>
                          <button
                            onClick={() => removeDeduction(d.id)}
                            className="p-1 rounded hover:bg-white/10 text-red-400"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {showAddDeduction ? (
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Deduction name"
                            value={newDeductionName}
                            onChange={(e) => setNewDeductionName(e.target.value)}
                            className="bg-white/5 border-white/10"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Amount"
                              className="pl-7 bg-white/5 border-white/10"
                              value={newDeductionAmount}
                              onChange={(e) => setNewDeductionAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {newDeductionCategory}
                              <IconChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[250px]">
                            <DropdownMenuRadioGroup value={newDeductionCategory} onValueChange={setNewDeductionCategory}>
                              {DEDUCTION_CATEGORIES.map(cat => (
                                <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowAddDeduction(false)}>
                            Cancel
                          </Button>
                          <Button className="flex-1" onClick={addDeduction}>
                            Add Deduction
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowAddDeduction(true)}
                      >
                        <IconPlus className="h-4 w-4 mr-2" />
                        Add Deduction
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Tax Credits */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <IconPigMoney className="h-5 w-5 text-green-400" />
                  Tax Credits
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Child Tax Credit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        className="pl-7 bg-white/5 border-white/10"
                        value={childTaxCredit || ""}
                        onChange={(e) => setChildTaxCredit(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Earned Income Credit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        className="pl-7 bg-white/5 border-white/10"
                        value={earnedIncomeCredit || ""}
                        onChange={(e) => setEarnedIncomeCredit(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Other Credits</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        className="pl-7 bg-white/5 border-white/10"
                        value={otherCredits || ""}
                        onChange={(e) => setOtherCredits(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {calculating ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground mt-4">Calculating...</p>
                </div>
              ) : taxCalculation ? (
                <>
                  {/* Summary Card */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-5">
                    <h3 className="font-semibold mb-4">Estimated Take-Home Pay</h3>
                    <p className="text-3xl font-bold text-green-400">
                      ${taxCalculation.takeHomePay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-muted-foreground">per year</p>
                    <p className="text-xl font-semibold mt-2">
                      ${taxCalculation.monthlyTakeHome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  {/* Chart */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-semibold mb-4">Income Breakdown</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, '']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tax Details */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-semibold mb-4">Tax Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross Income</span>
                        <span className="font-medium">${taxCalculation.grossIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deductions</span>
                        <span className="font-medium text-green-400">-${taxCalculation.totalDeductions.toLocaleString()}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxable Income</span>
                        <span className="font-medium">${taxCalculation.taxableIncome.toLocaleString()}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Federal Tax</span>
                        <span className="font-medium">${taxCalculation.federalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Credits</span>
                        <span className="font-medium text-green-400">-${taxCalculation.totalCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State Tax (est.)</span>
                        <span className="font-medium">${taxCalculation.estimatedStateTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">FICA (SS + Medicare)</span>
                        <span className="font-medium">${taxCalculation.ficaTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between">
                        <span className="font-medium">Total Tax</span>
                        <span className="font-bold text-red-400">${taxCalculation.totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Rates */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-semibold mb-4">Tax Rates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-white/5 text-center">
                        <p className="text-2xl font-bold text-blue-400">{taxCalculation.effectiveRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Effective Rate</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 text-center">
                        <p className="text-2xl font-bold text-purple-400">{taxCalculation.marginalRate.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Marginal Rate</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <IconCalculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enter Your Income</h3>
                  <p className="text-muted-foreground">
                    Add your annual income to see your estimated tax breakdown.
                  </p>
                </div>
              )}

              {/* Saved Estimates */}
              {savedEstimates.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold mb-4">Saved Estimates</h3>
                  <div className="space-y-2">
                    {savedEstimates.slice(0, 3).map(estimate => (
                      <div key={estimate.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="text-sm font-medium">{estimate.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Income: ${estimate.income.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-green-400">
                          ${estimate.takeHomePay.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
