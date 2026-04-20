"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  RefreshCw,
  Plus,
  Minus,
  History,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const balanceHistory = [
  { date: "Jan", balance: 5200 },
  { date: "Feb", balance: 5800 },
  { date: "Mar", balance: 5400 },
  { date: "Apr", balance: 6200 },
  { date: "May", balance: 6800 },
  { date: "Jun", balance: 7100 },
  { date: "Jul", balance: 7500 },
]

const transactions = [
  { id: 1, type: "deposit", amount: 500, date: "Today, 2:34 PM", method: "Credit Card", status: "completed" },
  { id: 2, type: "purchase", amount: -150, date: "Today, 10:15 AM", method: "Credits Used", status: "completed" },
  { id: 3, type: "deposit", amount: 1000, date: "Yesterday", method: "Bank Transfer", status: "completed" },
  { id: 4, type: "refund", amount: 50, date: "Jan 13, 2024", method: "Refund", status: "completed" },
  { id: 5, type: "purchase", amount: -200, date: "Jan 12, 2024", method: "Credits Used", status: "completed" },
  { id: 6, type: "deposit", amount: 2000, date: "Jan 10, 2024", method: "PayPal", status: "completed" },
]

const packages = [
  { credits: 1000, price: 10, popular: false, discount: null },
  { credits: 5000, price: 45, popular: true, discount: "10% OFF" },
  { credits: 10000, price: 80, popular: false, discount: "20% OFF" },
  { credits: 50000, price: 350, popular: false, discount: "30% OFF" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-neon-green">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function TradePage() {
  const [selectedPackage, setSelectedPackage] = useState(1)

  return (
    <DashboardLayout title="Trade & Credits">
      <div className="p-6 space-y-6">
        {/* Balance Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-neon-green/20 p-2.5">
                <Wallet className="h-5 w-5 text-neon-green" />
              </div>
              <span className="text-sm text-muted-foreground">Total Balance</span>
            </div>
            <p className="text-3xl font-bold text-foreground">$7,500</p>
            <div className="flex items-center gap-1.5 mt-2 text-neon-green text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.5% this month</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-neon-blue/20 p-2.5">
                <CreditCard className="h-5 w-5 text-neon-blue" />
              </div>
              <span className="text-sm text-muted-foreground">Available Credits</span>
            </div>
            <p className="text-3xl font-bold text-foreground">124,500</p>
            <p className="text-sm text-muted-foreground mt-2">~$1,245 value</p>
          </div>
          <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-neon-cyan/20 p-2.5">
                <TrendingUp className="h-5 w-5 text-neon-cyan" />
              </div>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <p className="text-3xl font-bold text-foreground">$2,340</p>
            <p className="text-sm text-muted-foreground mt-2">Spent on scraping</p>
          </div>
          <div className="rounded-2xl border border-deep-blue/30 bg-gradient-to-br from-deep-blue/10 to-transparent p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-deep-blue/20 p-2.5">
                <RefreshCw className="h-5 w-5 text-deep-blue" />
              </div>
              <span className="text-sm text-muted-foreground">Auto-Reload</span>
            </div>
            <p className="text-xl font-bold text-neon-green">Enabled</p>
            <p className="text-sm text-muted-foreground mt-2">When below 1000</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Balance Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Balance History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceHistory}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.18 165)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.7 0.18 165)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 250)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="oklch(0.7 0.18 165)"
                    fill="url(#colorBalance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/5 to-transparent p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Add Funds</h3>
              <div className="space-y-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Amount" className="pl-9 bg-muted/30 border-border/50 rounded-xl" />
                </div>
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-background font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Funds
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Withdraw</h3>
              <div className="space-y-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Amount" className="pl-9 bg-muted/30 border-border/50 rounded-xl" />
                </div>
                <button className="w-full py-2.5 rounded-xl bg-muted/50 text-foreground font-medium hover:bg-muted transition-all flex items-center justify-center gap-2">
                  <Minus className="h-4 w-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Buy Credits</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg, index) => (
              <button
                key={index}
                onClick={() => setSelectedPackage(index)}
                className={cn(
                  "relative rounded-2xl border p-5 text-left transition-all",
                  selectedPackage === index
                    ? "border-neon-cyan bg-neon-cyan/10 shadow-lg shadow-neon-cyan/10"
                    : "border-border bg-muted/20 hover:bg-muted/30"
                )}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-neon-blue to-neon-cyan text-background text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                )}
                {pkg.discount && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-neon-green/20 text-neon-green text-xs font-medium rounded-full">
                    {pkg.discount}
                  </span>
                )}
                <p className="text-3xl font-bold text-foreground mb-1">{pkg.credits.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mb-3">Credits</p>
                <p className="text-xl font-bold text-neon-cyan">${pkg.price}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-background font-medium hover:opacity-90 transition-all">
              Purchase Credits
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <button className="text-sm text-neon-cyan font-medium hover:underline flex items-center gap-1">
              <History className="h-4 w-4" />
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Method</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          tx.type === "deposit" || tx.type === "refund" ? "bg-neon-green/10" : "bg-destructive/10"
                        )}>
                          {tx.type === "deposit" || tx.type === "refund" ? (
                            <ArrowDownRight className="h-4 w-4 text-neon-green" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <span className="capitalize font-medium text-foreground">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "font-bold",
                        tx.amount > 0 ? "text-neon-green" : "text-foreground"
                      )}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount < 0 ? "-" : ""}${Math.abs(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{tx.method}</td>
                    <td className="px-5 py-4 text-muted-foreground">{tx.date}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-medium capitalize">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
