import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  databases,
  databaseId,
  COLLECTIONS,
  Query,
  type Party,
  type ExpenseHead,
  type PartyTransaction,
  type ExpenseTransaction,
} from '@/lib/appwrite'
import { useAuth } from '@/contexts/auth-context'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'

type ReportType = 'party' | 'expense' | 'combined'

export function ReportsPage() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState<ReportType>('combined')
  const [fromDate, setFromDate] = useState(formatDate(new Date(new Date().setDate(1))))
  const [toDate, setToDate] = useState(formatDate(new Date()))
  const [selectedParty, setSelectedParty] = useState<string>('all')
  const [selectedExpenseHead, setSelectedExpenseHead] = useState<string>('all')

  // Fetch parties
  const { data: parties = [] } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments<Party>(
        databaseId,
        COLLECTIONS.PARTIES,
        [Query.equal('userId', user.$id), Query.orderAsc('name')]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Fetch expense heads
  const { data: expenseHeads = [] } = useQuery({
    queryKey: ['expense_heads'],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments<ExpenseHead>(
        databaseId,
        COLLECTIONS.EXPENSE_HEADS,
        [Query.equal('userId', user.$id), Query.orderAsc('name')]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Fetch party transactions
  const { data: partyTransactions = [] } = useQuery({
    queryKey: ['party_transactions_report', fromDate, toDate, selectedParty],
    queryFn: async () => {
      if (!user?.$id) return []
      const queries = [
        Query.equal('userId', user.$id),
        Query.greaterThanEqual('date', fromDate),
        Query.lessThanEqual('date', toDate),
        Query.orderDesc('date'),
      ]
      if (selectedParty !== 'all') {
        queries.push(Query.equal('partyId', selectedParty))
      }
      const response = await databases.listDocuments<PartyTransaction>(
        databaseId,
        COLLECTIONS.PARTY_TRANSACTIONS,
        queries
      )
      return response.documents
    },
    enabled: !!user?.$id && (reportType === 'party' || reportType === 'combined'),
  })

  // Fetch expense transactions
  const { data: expenseTransactions = [] } = useQuery({
    queryKey: ['expense_transactions_report', fromDate, toDate, selectedExpenseHead],
    queryFn: async () => {
      if (!user?.$id) return []
      const queries = [
        Query.equal('userId', user.$id),
        Query.greaterThanEqual('date', fromDate),
        Query.lessThanEqual('date', toDate),
        Query.orderDesc('date'),
      ]
      if (selectedExpenseHead !== 'all') {
        queries.push(Query.equal('expenseHeadId', selectedExpenseHead))
      }
      const response = await databases.listDocuments<ExpenseTransaction>(
        databaseId,
        COLLECTIONS.EXPENSE_TRANSACTIONS,
        queries
      )
      return response.documents
    },
    enabled: !!user?.$id && (reportType === 'expense' || reportType === 'combined'),
  })

  // Join party transactions with parties
  const partyTransactionsWithDetails = useMemo(() => {
    return partyTransactions.map((transaction) => {
      const party = parties.find((p) => p.$id === transaction.partyId)
      return {
        ...transaction,
        party,
      }
    })
  }, [partyTransactions, parties])

  // Join expense transactions with expense heads
  const expenseTransactionsWithDetails = useMemo(() => {
    return expenseTransactions.map((transaction) => {
      const expenseHead = expenseHeads.find((h) => h.$id === transaction.expenseHeadId)
      return {
        ...transaction,
        expenseHead,
      }
    })
  }, [expenseTransactions, expenseHeads])

  // Calculate totals
  const partyTotalPaid = partyTransactionsWithDetails
    .filter((t) => t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0)

  const partyTotalReceived = partyTransactionsWithDetails
    .filter((t) => !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseTotal = expenseTransactionsWithDetails.reduce((sum, t) => sum + t.amount, 0)


  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>View and analyze your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="report-type" className="text-sm font-medium">
                  Report Type
                </label>
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as ReportType)}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="party">Party Transactions</SelectItem>
                    <SelectItem value="expense">Expense Transactions</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(reportType === 'party' || reportType === 'combined') && (
                <div className="space-y-2">
                  <label htmlFor="party-filter" className="text-sm font-medium">
                    Filter by Party
                  </label>
                  <Select value={selectedParty} onValueChange={setSelectedParty}>
                    <SelectTrigger id="party-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Parties</SelectItem>
                      {parties.map((party) => (
                        <SelectItem key={party.$id} value={party.$id}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {(reportType === 'expense' || reportType === 'combined') && (
                <div className="space-y-2">
                  <label htmlFor="expense-filter" className="text-sm font-medium">
                    Filter by Expense Head
                  </label>
                  <Select value={selectedExpenseHead} onValueChange={setSelectedExpenseHead}>
                    <SelectTrigger id="expense-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Expense Heads</SelectItem>
                      {expenseHeads.map((head) => (
                        <SelectItem key={head.$id} value={head.$id}>
                          {head.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="from-date" className="text-sm font-medium">
                  From Date
                </label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="to-date" className="text-sm font-medium">
                  To Date
                </label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(reportType === 'party' || reportType === 'combined') && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Paid (Given)</CardDescription>
                <CardTitle className="text-2xl text-red-600">
                  {formatCurrency(partyTotalPaid)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Received</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {formatCurrency(partyTotalReceived)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Net Balance</CardDescription>
                <CardTitle
                  className={`text-2xl ${
                    partyTotalReceived - partyTotalPaid >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(partyTotalReceived - partyTotalPaid)}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
        {(reportType === 'expense' || reportType === 'combined') && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {formatCurrency(expenseTotal)}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Transaction List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Line-by-line list of all transactions in the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(reportType === 'party' || reportType === 'combined') && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Party Transactions</h3>
              {partyTransactionsWithDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No party transactions in this date range
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-2 font-semibold text-sm border-b bg-muted/50 rounded-t">
                    <div className="col-span-2 sm:col-span-1">Date</div>
                    <div className="col-span-4 sm:col-span-3">Party</div>
                    <div className="col-span-3 sm:col-span-2">Amount</div>
                    <div className="col-span-2 sm:col-span-2">Status</div>
                    <div className="col-span-1 sm:col-span-4 hidden sm:block">Description</div>
                  </div>
                  {partyTransactionsWithDetails.map((transaction) => (
                    <div
                      key={transaction.$id}
                      className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-accent/50 transition-colors text-sm"
                    >
                      <div className="col-span-2 sm:col-span-1">{transaction.date}</div>
                      <div className="col-span-4 sm:col-span-3 font-medium">
                        {transaction.party?.name || 'Unknown'}
                        {transaction.party?.town && (
                          <span className="text-xs text-muted-foreground block sm:inline sm:ml-1">
                            ({transaction.party.town})
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-2 font-semibold">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="col-span-2 sm:col-span-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs border ${
                            transaction.isPaid
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {transaction.isPaid ? 'Paid (Given)' : 'Received'}
                        </span>
                      </div>
                      <div className="col-span-12 sm:col-span-4 text-muted-foreground text-xs sm:text-sm">
                        {transaction.description || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(reportType === 'expense' || reportType === 'combined') && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Expense Transactions</h3>
              {expenseTransactionsWithDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expense transactions in this date range
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-2 font-semibold text-sm border-b bg-muted/50 rounded-t">
                    <div className="col-span-2 sm:col-span-1">Date</div>
                    <div className="col-span-4 sm:col-span-3">Expense Head</div>
                    <div className="col-span-3 sm:col-span-2">Amount</div>
                    <div className="col-span-2 sm:col-span-2">Category</div>
                    <div className="col-span-1 sm:col-span-4 hidden sm:block">Description</div>
                  </div>
                  {expenseTransactionsWithDetails.map((transaction) => (
                    <div
                      key={transaction.$id}
                      className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-accent/50 transition-colors text-sm"
                    >
                      <div className="col-span-2 sm:col-span-1">{transaction.date}</div>
                      <div className="col-span-4 sm:col-span-3 font-medium">
                        {transaction.expenseHead?.name || 'Unknown'}
                      </div>
                      <div className="col-span-3 sm:col-span-2 font-semibold">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="col-span-2 sm:col-span-2">
                        <span className="inline-block px-2 py-1 rounded text-xs border bg-blue-50 text-blue-700 border-blue-200">
                          {transaction.expenseHead?.category || 'Unknown'}
                        </span>
                      </div>
                      <div className="col-span-12 sm:col-span-4 text-muted-foreground text-xs sm:text-sm">
                        {transaction.description || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {reportType === 'combined' &&
            partyTransactionsWithDetails.length === 0 &&
            expenseTransactionsWithDetails.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found in the selected date range
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
