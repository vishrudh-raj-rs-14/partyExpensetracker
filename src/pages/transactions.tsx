import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  databases,
  databaseId,
  COLLECTIONS,
  ID,
  Query,
  type Party,
  type ExpenseHead,
  type PartyTransaction,
  type ExpenseTransaction,
} from '@/lib/appwrite'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

export function TransactionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Party transaction form state
  const [partyId, setPartyId] = useState('')
  const [partyAmount, setPartyAmount] = useState('')
  const [partyDescription, setPartyDescription] = useState('')
  const [isPaid, setIsPaid] = useState(true)
  const [partyDate, setPartyDate] = useState(formatDate(new Date()))

  // Expense transaction form state
  const [expenseHeadId, setExpenseHeadId] = useState('')
  const [expensePartyId, setExpensePartyId] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(formatDate(new Date()))

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
  const { data: partyTransactions = [], isLoading: loadingPartyTransactions } = useQuery({
    queryKey: ['party_transactions'],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments<PartyTransaction>(
        databaseId,
        COLLECTIONS.PARTY_TRANSACTIONS,
        [Query.equal('userId', user.$id), Query.orderDesc('date')]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Fetch expense transactions
  const { data: expenseTransactions = [], isLoading: loadingExpenseTransactions } = useQuery({
    queryKey: ['expense_transactions'],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments<ExpenseTransaction>(
        databaseId,
        COLLECTIONS.EXPENSE_TRANSACTIONS,
        [Query.equal('userId', user.$id), Query.orderDesc('date')]
      )
      return response.documents
    },
    enabled: !!user?.$id,
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

  // Join expense transactions with expense heads and parties
  const expenseTransactionsWithDetails = useMemo(() => {
    return expenseTransactions.map((transaction) => {
      const expenseHead = expenseHeads.find((h) => h.$id === transaction.expenseHeadId)
      const party = parties.find((p) => p.$id === transaction.partyId)
      return {
        ...transaction,
        expenseHead,
        party,
      }
    })
  }, [expenseTransactions, expenseHeads, parties])

  // Create party transaction
  const createPartyTransactionMutation = useMutation({
    mutationFn: async (data: {
      partyId: string
      amount: number
      description?: string
      isPaid: boolean
      date: string
    }) => {
      if (!user?.$id) throw new Error('User not authenticated')
      const documentData: any = {
        partyId: data.partyId,
        amount: data.amount,
        isPaid: data.isPaid,
        date: data.date,
        userId: user.$id,
      }
      // Only include description if it has a value (don't send empty string for optional fields)
      if (data.description && data.description.trim()) {
        documentData.description = data.description.trim()
      }
      await databases.createDocument(databaseId, COLLECTIONS.PARTY_TRANSACTIONS, ID.unique(), documentData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party_transactions'] })
      setPartyId('')
      setPartyAmount('')
      setPartyDescription('')
      setIsPaid(true)
      setPartyDate(formatDate(new Date()))
      toast({
        title: 'Success',
        description: 'Party transaction added successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      })
    },
  })

  // Create expense transaction
  const createExpenseTransactionMutation = useMutation({
    mutationFn: async (data: {
      expenseHeadId: string
      partyId: string
      amount: number
      description?: string
      date: string
    }) => {
      if (!user?.$id) throw new Error('User not authenticated')
      const documentData: any = {
        expenseHeadId: data.expenseHeadId,
        partyId: data.partyId,
        amount: data.amount,
        date: data.date,
        userId: user.$id,
      }
      // Only include description if it has a value (don't send empty string for optional fields)
      if (data.description && data.description.trim()) {
        documentData.description = data.description.trim()
      }
      await databases.createDocument(databaseId, COLLECTIONS.EXPENSE_TRANSACTIONS, ID.unique(), documentData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_transactions'] })
      setExpenseHeadId('')
      setExpensePartyId('')
      setExpenseAmount('')
      setExpenseDescription('')
      setExpenseDate(formatDate(new Date()))
      toast({
        title: 'Success',
        description: 'Expense transaction added successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      })
    },
  })

  // Delete party transaction
  const deletePartyTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await databases.deleteDocument(databaseId, COLLECTIONS.PARTY_TRANSACTIONS, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['party_transactions'] })
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete transaction',
        variant: 'destructive',
      })
    },
  })

  // Delete expense transaction
  const deleteExpenseTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await databases.deleteDocument(databaseId, COLLECTIONS.EXPENSE_TRANSACTIONS, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_transactions'] })
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete transaction',
        variant: 'destructive',
      })
    },
  })

  const handlePartySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!partyId || !partyAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    createPartyTransactionMutation.mutate({
      partyId,
      amount: parseFloat(partyAmount),
      description: partyDescription.trim() || undefined,
      isPaid,
      date: partyDate,
    })
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseHeadId || !expensePartyId || !expenseAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    createExpenseTransactionMutation.mutate({
      expenseHeadId,
      partyId: expensePartyId,
      amount: parseFloat(expenseAmount),
      description: expenseDescription.trim() || undefined,
      date: expenseDate,
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Tabs defaultValue="party" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="party">Party Transactions</TabsTrigger>
          <TabsTrigger value="expense">Expense Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="party">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Party Transaction</CardTitle>
              <CardDescription>Record money given or received from a party</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePartySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="party" className="text-sm font-medium">
                      Party *
                    </label>
                    <Select value={partyId} onValueChange={setPartyId} required>
                      <SelectTrigger id="party">
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party.$id} value={party.$id}>
                            {party.name} ({party.town})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="party-amount" className="text-sm font-medium">
                      Amount *
                    </label>
                    <Input
                      id="party-amount"
                      type="number"
                      step="0.01"
                      value={partyAmount}
                      onChange={(e) => setPartyAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="party-date" className="text-sm font-medium">
                      Date *
                    </label>
                    <Input
                      id="party-date"
                      type="date"
                      value={partyDate}
                      onChange={(e) => setPartyDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="party-status" className="text-sm font-medium">
                      Status *
                    </label>
                    <Select
                      value={isPaid ? 'paid' : 'received'}
                      onValueChange={(value) => setIsPaid(value === 'paid')}
                    >
                      <SelectTrigger id="party-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid (Given)</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="party-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="party-description"
                    value={partyDescription}
                    onChange={(e) => setPartyDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createPartyTransactionMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Party Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPartyTransactions ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : partyTransactionsWithDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No party transactions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {partyTransactionsWithDetails.map((transaction) => (
                    <div
                      key={transaction.$id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {transaction.party?.name || 'Unknown'} (
                          {transaction.party?.town || 'Unknown'})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(transaction.amount)} - {transaction.date}
                        </div>
                        <div className="text-sm">
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
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction?')) {
                            deletePartyTransactionMutation.mutate(transaction.$id)
                          }
                        }}
                        disabled={deletePartyTransactionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Expense Transaction</CardTitle>
              <CardDescription>Record an expense transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="expense-head" className="text-sm font-medium">
                      Expense Head *
                    </label>
                    <Select value={expenseHeadId} onValueChange={setExpenseHeadId} required>
                      <SelectTrigger id="expense-head">
                        <SelectValue placeholder="Select expense head" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseHeads.map((head) => (
                          <SelectItem key={head.$id} value={head.$id}>
                            {head.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expense-party" className="text-sm font-medium">
                      Party *
                    </label>
                    <Select value={expensePartyId} onValueChange={setExpensePartyId} required>
                      <SelectTrigger id="expense-party">
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party.$id} value={party.$id}>
                            {party.name} ({party.town})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expense-amount" className="text-sm font-medium">
                      Amount *
                    </label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expense-date" className="text-sm font-medium">
                      Date *
                    </label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="expense-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="expense-description"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createExpenseTransactionMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingExpenseTransactions ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : expenseTransactionsWithDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expense transactions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {expenseTransactionsWithDetails.map((transaction) => (
                    <div
                      key={transaction.$id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {transaction.expenseHead?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Party: {transaction.party?.name || 'Unknown'}
                          {transaction.party?.town && ` (${transaction.party.town})`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(transaction.amount)} - {transaction.date}
                        </div>
                        <div className="text-sm">
                          <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {transaction.expenseHead?.category || 'Unknown'}
                          </span>
                        </div>
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction?')) {
                            deleteExpenseTransactionMutation.mutate(transaction.$id)
                          }
                        }}
                        disabled={deleteExpenseTransactionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
