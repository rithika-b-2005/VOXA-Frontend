# Voxa Expense - Complete Feature Documentation

This document provides comprehensive documentation for all features available in the Voxa Expense application.

---

## Table of Contents

1. [Overview (Dashboard)](#1-overview-dashboard)
2. [Transaction](#2-transaction)
3. [Categories](#3-categories)
4. [Goals](#4-goals)
5. [Net Worth](#5-net-worth)
6. [Debt Planner](#6-debt-planner)
7. [Tax Estimation](#7-tax-estimation)
8. [Saving Tips](#8-saving-tips)
9. [Benchmarks](#9-benchmarks)
10. [Learn](#10-learn)
11. [Subscriptions](#11-subscriptions)
12. [Reminders](#12-reminders)
13. [Settings](#13-settings)

---

## 1. Overview (Dashboard)

**Path:** `/Dashboard`
**Icon:** `IconLayoutDashboard`

### Description
The main dashboard providing a high-level summary of your financial status at a glance.

### Features
- **Total Balance:** Displays your current overall balance
- **Income vs Expenses:** Visual comparison of money coming in vs going out
- **Recent Transactions:** Quick view of your latest transactions
- **Spending Trends:** Charts showing spending patterns over time
- **Budget Alerts:** Notifications when approaching or exceeding budget limits
- **Quick Insights:** AI-powered insights about your spending habits
- **Category Breakdown:** Pie chart showing spending distribution by category

### How It Works
1. Aggregates data from all your transactions
2. Calculates totals for income and expenses
3. Fetches budget status to show alerts
4. Displays trend data using Recharts library
5. Updates in real-time when new transactions are added

### Data Sources
- `/api/expenses` - Transaction data
- `/api/expenses/stats` - Statistics
- `/api/expenses/trend` - Trend data
- `/api/budgets/status` - Budget status
- `/api/budgets/alerts` - Budget alerts

---

## 2. Transaction

**Path:** `/Dashboard/transaction`
**Icon:** `IconArrowsExchange`

### Description
The core transaction management system for recording, viewing, editing, and managing all your income and expenses.

### Features

#### Adding Transactions
- **Manual Entry:** Add transactions with date, amount, payee, category, payment mode
- **Receipt Upload:** Attach receipt images (supports images and PDFs)
- **Interest Tags:** Tag transactions with lifestyle/interest categories:
  - Essential, Lifestyle, Entertainment, Health & Wellness
  - Education, Travel, Social, Hobby, Investment
  - Impulse Buy, Recurring, Gift
- **Voice Input:** Add transactions using voice commands (multilingual support)

#### Viewing Transactions
- **Date Filter:** Filter transactions by specific date
- **Search:** Search by payee name or category
- **Table View:** Sortable table with columns:
  - #, Category, Payee, Amount, Type, Payment, Tags, Receipt
- **Selection:** Multi-select transactions for bulk operations

#### Managing Transactions
- **Edit:** Modify existing transactions
- **Delete:** Remove single or multiple transactions
- **View Receipt:** Preview attached receipts

#### Import/Export
- **Import:** Import transactions from Excel/CSV files
  - Preview before importing
  - Options: Replace all or Append
- **Export:** Export transactions to Excel format
- **Share:** Share transaction reports via WhatsApp

#### Voice Input System
- Supports multiple languages (English, Hindi, Tamil, etc.)
- Step-by-step voice guidance:
  1. Select language
  2. Choose type (expense/income)
  3. Enter amount
  4. Specify payer/payee
  5. Add description
  6. Select category
  7. Choose payment mode
  8. Confirm transaction

### Premium Features
- Non-premium users have credit limits for:
  - Adding transactions (10 credits)
  - Import (10 credits)
  - Export (10 credits)
  - Share (10 credits)
  - Voice input (1 credit per use)

### Data Structure
```typescript
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
```

---

## 3. Categories

**Path:** `/Dashboard/categories`
**Icon:** `IconFolder`

### Description
Manage spending categories and set budgets for each category to control your spending.

### Features

#### Category Management
- View all spending categories with colors
- See spending amount per category
- Track budget usage with progress bars

#### Budget Management
- **Create Budgets:** Set spending limits for categories
- **Budget Periods:**
  - Weekly
  - Monthly
  - Yearly
- **Alert Thresholds:**
  - 50% warning
  - 80% critical warning
  - 100% exceeded alert
- **Budget Status:**
  - GOOD (green) - Under 50%
  - WARNING (yellow) - 50-80%
  - CRITICAL (orange) - 80-100%
  - EXCEEDED (red) - Over 100%

#### Summary Cards
- Total Budget: Sum of all budget limits
- Total Spent: Sum of all spending
- Remaining: Budget - Spent
- Categories Count: Number of budgeted categories

### How Budgets Work
1. Set a budget amount for a category
2. Choose the budget period (weekly/monthly/yearly)
3. Configure alert thresholds
4. System tracks spending against the budget
5. Alerts are triggered when thresholds are crossed
6. Budget resets based on the period

### API Endpoints
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/status` - Get budget status with spending
- `POST /api/budgets` - Create new budget
- `PATCH /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

---

## 4. Goals

**Path:** `/Dashboard/goals`
**Icon:** `IconTargetArrow`

### Description
Set and track savings goals for specific purposes like vacation, emergency fund, or major purchases.

### Features

#### Creating Goals
- **Goal Name:** What you're saving for
- **Target Amount:** How much you need
- **Current Amount:** How much you have saved
- **Deadline:** Target date to reach the goal
- **Category:** Type of goal (Emergency, Vacation, Purchase, Education, Retirement, Other)

#### Tracking Progress
- **Progress Bar:** Visual representation of goal completion
- **Percentage Complete:** Exact completion percentage
- **Amount Remaining:** How much more to save
- **Days Remaining:** Time left until deadline
- **Projected Completion:** Estimated date based on saving rate

#### Contribution History
- Track individual contributions to each goal
- See contribution dates and amounts
- Add new contributions anytime

#### Goal Status
- **On Track:** Projected to meet deadline
- **Behind:** May not meet deadline at current rate
- **Completed:** Goal reached

### Summary Cards
- Total Goals: Number of active goals
- Total Target: Sum of all goal amounts
- Total Saved: Sum of current amounts
- Completion Rate: Average completion percentage

### Data Structure
```typescript
interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  contributions: {
    date: string
    amount: number
  }[]
}
```

---

## 5. Net Worth

**Path:** `/Dashboard/net-worth`
**Icon:** `IconChartLine`

### Description
Track your complete financial picture by recording all assets and liabilities to calculate your net worth.

### Features

#### Assets Tracking
Track what you own:
- **Cash & Bank:** Checking, savings, cash on hand
- **Investments:** Stocks, bonds, mutual funds, crypto
- **Property:** Real estate, land
- **Vehicles:** Cars, motorcycles, boats
- **Other Assets:** Jewelry, collectibles, etc.

#### Liabilities Tracking
Track what you owe:
- **Credit Cards:** Outstanding balances
- **Loans:** Personal, auto, student loans
- **Mortgage:** Home loans
- **Other Debts:** Any other obligations

#### Net Worth Calculation
```
Net Worth = Total Assets - Total Liabilities
```

#### Historical Tracking
- View net worth changes over time
- Line chart showing net worth history
- Track growth or decline trends

#### Adding Items
- Name of asset/liability
- Current value/balance
- Type/category
- Optional notes

### Summary Cards
- Total Assets: Sum of all asset values
- Total Liabilities: Sum of all debt balances
- Net Worth: Assets minus Liabilities
- Monthly Change: Change from previous month

### Data Structure
```typescript
interface Asset {
  id: string
  name: string
  value: number
  type: "cash" | "investment" | "property" | "vehicle" | "other"
}

interface Liability {
  id: string
  name: string
  balance: number
  type: "credit_card" | "loan" | "mortgage" | "other"
}
```

---

## 6. Debt Planner

**Path:** `/Dashboard/debt-planner`
**Icon:** `IconCreditCard`

### Description
Plan your debt payoff strategy using proven methods like Snowball or Avalanche to become debt-free faster.

### Features

#### Debt Entry
- Debt name (e.g., "Chase Credit Card")
- Current balance
- Interest rate (APR)
- Minimum monthly payment

#### Payoff Strategies

**Avalanche Method (Recommended for saving money)**
- Pay minimums on all debts
- Put extra money toward highest interest rate debt
- Once paid off, move to next highest rate
- **Benefit:** Saves the most money on interest

**Snowball Method (Recommended for motivation)**
- Pay minimums on all debts
- Put extra money toward smallest balance
- Once paid off, move to next smallest
- **Benefit:** Quick wins for motivation

#### Extra Payment Calculator
- Input extra monthly payment amount
- See impact on payoff timeline
- Compare interest saved between methods

#### Payoff Projections
- Total months to become debt-free
- Total interest paid
- Payoff date for each debt
- Payment schedule

### Comparison View
| Metric | Avalanche | Snowball |
|--------|-----------|----------|
| Total Interest | Lower | Higher |
| Payoff Time | Same | Same |
| First Payoff | Varies | Faster |

### Summary Cards
- Total Debt: Sum of all balances
- Total Interest: Projected interest if paying minimums
- Interest Saved: Savings with extra payments
- Debt-Free Date: Projected payoff date

### Data Structure
```typescript
interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
}
```

---

## 7. Tax Estimation

**Path:** `/Dashboard/tax-estimation`
**Icon:** `IconReceipt2`

### Description
Estimate your federal and state taxes based on income, deductions, and credits using 2024 tax brackets.

### Features

#### Income Input
- Annual gross income
- Filing status:
  - Single
  - Married Filing Jointly
  - Head of Household

#### Deductions

**Standard Deduction (2024)**
- Single: $14,600
- Married: $29,200
- Head of Household: $21,900

**Itemized Deductions**
- Mortgage Interest
- State & Local Taxes (SALT)
- Charitable Contributions
- Medical Expenses
- Student Loan Interest
- Business Expenses
- Home Office
- Education Expenses

#### Tax Credits
- Child Tax Credit
- Earned Income Credit (EITC)
- Other credits

#### Tax Calculation

**Federal Tax Brackets 2024 (Single)**
| Income Range | Tax Rate |
|--------------|----------|
| $0 - $11,600 | 10% |
| $11,600 - $47,150 | 12% |
| $47,150 - $100,525 | 22% |
| $100,525 - $191,950 | 24% |
| $191,950 - $243,725 | 32% |
| $243,725 - $609,350 | 35% |
| $609,350+ | 37% |

**FICA Taxes**
- Social Security: 6.2% (up to $168,600)
- Medicare: 1.45%
- Additional Medicare: 0.9% (income over $200,000)

**State Tax**
- Estimated at 5% (simplified)

#### Results Display
- Taxable Income
- Federal Tax
- State Tax (estimated)
- FICA Taxes
- Total Tax
- Effective Tax Rate
- Marginal Tax Rate
- Take-Home Pay (yearly and monthly)
- Income breakdown pie chart

### Disclaimer
This is an estimate only. Consult a qualified tax professional for accurate tax planning.

---

## 8. Saving Tips

**Path:** `/Dashboard/saving-tips`
**Icon:** `IconBulb`

### Description
Get personalized, AI-powered saving tips based on your actual spending patterns and financial habits.

### Features

#### Personalized Analysis
Tips are generated based on:
- Your spending by category
- Budget status and alerts
- Transaction patterns
- Average transaction size

#### Tip Categories
- **Food & Dining:** Meal prep, dining out reduction
- **Shopping:** Impulse buying control, 24-hour rule
- **Transportation:** Carpooling, public transit
- **Entertainment:** Subscription auditing
- **Housing:** Rent negotiation, utility savings
- **General:** Automation, savings habits

#### Tip Information
Each tip includes:
- **Title:** Clear actionable title
- **Description:** Personalized explanation
- **Potential Savings:** Estimated monthly savings
- **Difficulty:** Easy, Medium, or Hard
- **Priority:** High, Medium, or Low
- **Action Steps:** Specific things to do

#### Save Tips
- Bookmark tips for later reference
- Track which tips you've saved
- Access saved tips anytime

### Summary Cards
- Potential Monthly Savings: Total possible savings
- Active Tips: Number of tips available
- Saved Tips: Tips you've bookmarked
- High Priority: Urgent tips count

### How Tips Are Generated
1. Analyze spending patterns from transactions
2. Compare to recommended percentages
3. Check budget status for overages
4. Calculate potential savings
5. Rank by priority and potential impact

---

## 9. Benchmarks

**Path:** `/Dashboard/benchmarks`
**Icon:** `IconUsers`

### Description
Compare your spending habits with similar users to understand where you stand and identify areas for improvement.

### Features

#### Demographic Filters
Compare with users who share:
- **Age Group:** 18-24, 25-34, 35-44, 45-54, 55+
- **Income Range:** $25k-50k, $50k-75k, $75k-100k, $100k+
- **Location Type:** Urban, Suburban, Rural

#### Comparison Metrics
For each spending category:
- **Your Spending:** Your actual amount
- **Average Spending:** What similar users spend
- **Top Savers:** 90th percentile of savers
- **Your Percentile:** Where you rank

#### Status Indicators
- **Below Average:** Spending less than peers (good)
- **Average:** Spending similar to peers
- **Above Average:** Spending more than peers

#### Visualization
- Bar chart comparing:
  - Your spending
  - Average spending
  - Top savers spending
- Progress bars showing percentile ranking

### Summary Cards
- Your Percentile: Overall ranking
- Better Than Average: Categories where you excel
- Room to Improve: Categories to work on
- vs Average: Dollar difference from average

### Categories Compared
- Food & Dining
- Shopping
- Transportation
- Entertainment
- Utilities
- Healthcare
- Housing
- Personal Care
- Education
- Travel

---

## 10. Learn

**Path:** `/Dashboard/recommendations`
**Icon:** `IconBook`

### Description
Access personalized financial education content including articles, videos, podcasts, and courses based on your interests.

### Features

#### Content Types
- **Articles:** Quick reads on financial topics
- **Videos:** Visual learning content
- **Podcasts:** Audio financial education
- **Courses:** In-depth learning programs

#### Content Categories
- Budgeting
- Saving
- Debt Management
- Investing
- Credit
- Taxes
- Housing
- Income
- Retirement

#### Personalization
Content is ranked by relevance based on:
- Your spending patterns
- Categories you spend most on
- Financial goals
- Detected interests from transactions

#### Content Features
- **Read Time:** Estimated time to consume
- **Relevance Score:** Match percentage to your interests
- **Tags:** Topic labels for easy filtering
- **Author:** Content creator

#### Content Management
- **Save:** Bookmark content for later
- **Complete:** Mark as finished
- **Filter:** By type or category

### Summary Cards
- Available Content: Total content pieces
- Saved: Bookmarked items
- Completed: Finished items
- Top Match: Highest relevance score

---

## 11. Subscriptions

**Path:** `/Dashboard/subscriptions`
**Icon:** `IconRefresh`

### Description
Track and manage all your recurring subscriptions and memberships to avoid unwanted charges.

### Features

#### Subscription Tracking
- **Service Name:** Netflix, Spotify, etc.
- **Amount:** Monthly or yearly cost
- **Billing Cycle:** Monthly, Yearly, Weekly
- **Next Billing Date:** When you'll be charged
- **Category:** Entertainment, Software, Health, etc.

#### Cost Analysis
- Total monthly cost
- Total yearly cost
- Cost breakdown by category
- Spending trends

#### Management
- Add new subscriptions
- Edit existing ones
- Mark as cancelled
- Set reminders before billing

#### Alerts
- Upcoming billing notifications
- Price increase alerts
- Annual renewal reminders

### Summary Cards
- Monthly Cost: Total monthly subscriptions
- Yearly Cost: Annualized total
- Active Subscriptions: Count of active
- Upcoming Bills: Bills in next 7 days

### Data Structure
```typescript
interface Subscription {
  id: string
  name: string
  amount: number
  cycle: "monthly" | "yearly" | "weekly"
  nextBilling: string
  category: string
  isActive: boolean
}
```

---

## 12. Reminders

**Path:** `/Dashboard/reminders`
**Icon:** `IconBell`

### Description
Set up bill reminders to never miss a payment and avoid late fees.

### Features

#### Reminder Types
- **One-time:** Single payment reminder
- **Weekly:** Recurring weekly bills
- **Monthly:** Regular monthly bills
- **Yearly:** Annual payments

#### Reminder Information
- Bill name
- Amount due
- Due date
- Frequency
- Notes/description

#### Status Tracking
- **Pending:** Upcoming bills
- **Overdue:** Missed payments
- **Paid:** Completed payments

#### Actions
- Mark as paid
- Snooze reminder
- Edit details
- Delete reminder

#### Auto-Update
For recurring reminders:
- Automatically updates next due date when marked paid
- Maintains payment history

### Summary Cards
- Total Due: Sum of pending amounts
- Upcoming: Bills due in 7 days
- Overdue: Missed payments
- Paid This Month: Completed payments

### Data Structure
```typescript
interface Reminder {
  id: string
  name: string
  amount: number
  dueDate: string
  frequency: "one-time" | "weekly" | "monthly" | "yearly"
  status: "pending" | "paid" | "overdue"
  notes?: string
}
```

---

## 13. Settings

**Path:** `/Dashboard/settings`
**Icon:** `IconSettings`

### Description
Configure application preferences and account settings.

### Features

#### Account Settings
- Change password
- Update email
- Manage notifications
- Delete account

#### App Preferences
- Currency format
- Date format
- Theme (dark/light)
- Language

#### Notifications
- Email notifications
- Push notifications
- Budget alerts
- Bill reminders

#### Data Management
- Export all data
- Import data
- Clear transaction history
- Backup settings

#### Security
- Two-factor authentication
- Session management
- Login history

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 16.0.6
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI, shadcn/ui
- **Icons:** Tabler Icons
- **Charts:** Recharts
- **State Management:** React Context (AuthContext)

### API Integration
- RESTful API calls via `lib/api.ts`
- Token-based authentication
- Automatic token refresh

### Data Persistence
- **Backend:** API server with database
- **Local Storage:** Used for:
  - Interest tags per transaction
  - Saved tips
  - Saved content
  - Credit counts (non-premium)
  - User preferences

### File Structure
```
app/
├── Dashboard/
│   ├── page.tsx              # Overview
│   ├── transaction/
│   ├── categories/
│   ├── goals/
│   ├── net-worth/
│   ├── debt-planner/
│   ├── tax-estimation/
│   ├── saving-tips/
│   ├── benchmarks/
│   ├── recommendations/
│   ├── subscriptions/
│   ├── reminders/
│   ├── profile/
│   └── settings/
components/
├── app-sidebar.tsx           # Navigation sidebar
├── nav-main.tsx              # Navigation items
└── ui/                       # UI components
contexts/
└── AuthContext.tsx           # Authentication state
lib/
└── api.ts                    # API client
hooks/
└── useApi.ts                 # API hooks
```

---

## Premium Features

Premium users get unlimited access to:
- Transaction add/edit/delete
- Import/Export functionality
- Share reports
- Voice input
- All features without credit limits

Non-premium users have credit-based access:
- 10 free credits per feature category
- Credits deducted on use
- Upgrade prompt when credits exhausted

---

## Support

For help or feedback:
- Report issues: https://github.com/anthropics/claude-code/issues
- Use `/help` command in the app
