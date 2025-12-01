import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { databases, databaseId, COLLECTIONS, ID, Query, type ExpenseHead } from '@/lib/appwrite'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2 } from 'lucide-react'

type ExpenseCategory = 'need' | 'wants' | 'pride' | 'unexpected'

const categoryLabels: Record<ExpenseCategory, string> = {
  need: 'Need',
  wants: 'Wants',
  pride: 'Pride',
  unexpected: 'Unexpected',
}

export function ExpenseHeadsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('need')

  const { data: expenseHeads = [], isLoading } = useQuery({
    queryKey: ['expense_heads'],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments<ExpenseHead>(
        databaseId,
        COLLECTIONS.EXPENSE_HEADS,
        [Query.equal('userId', user.$id), Query.orderDesc('$id')]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Fetch expense transactions to check if expense heads have transactions
  const { data: expenseTransactions = [] } = useQuery({
    queryKey: ['expense_transactions', user?.$id],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments(
        databaseId,
        COLLECTIONS.EXPENSE_TRANSACTIONS,
        [Query.equal('userId', user.$id)]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Helper function to check if an expense head has transactions
  const expenseHeadHasTransactions = (expenseHeadId: string) => {
    return expenseTransactions.some((transaction: any) => transaction.expenseHeadId === expenseHeadId)
  }

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: ExpenseCategory }) => {
      if (!user?.$id) throw new Error('User not authenticated')
      await databases.createDocument(databaseId, COLLECTIONS.EXPENSE_HEADS, ID.unique(), {
        name: data.name,
        category: data.category,
        userId: user.$id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_heads'] })
      setName('')
      setCategory('need')
      toast({
        title: 'Success',
        description: 'Expense head added successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add expense head',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await databases.deleteDocument(databaseId, COLLECTIONS.EXPENSE_HEADS, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_heads'] })
      toast({
        title: 'Success',
        description: 'Expense head deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete expense head',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a head name',
        variant: 'destructive',
      })
      return
    }
    createMutation.mutate({ name: name.trim(), category })
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Expense Head</CardTitle>
          <CardDescription>Create expense categories to track your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Head Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Groceries, Rent, Entertainment"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="need">Need</SelectItem>
                    <SelectItem value="wants">Wants</SelectItem>
                    <SelectItem value="pride">Pride</SelectItem>
                    <SelectItem value="unexpected">Unexpected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense Head
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Heads</CardTitle>
          <CardDescription>List of all expense heads</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : expenseHeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expense heads added yet
            </div>
          ) : (
            <div className="space-y-2">
              {expenseHeads.map((head) => (
                <div
                  key={head.$id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{head.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Category: {categoryLabels[head.category as ExpenseCategory]}
                    </div>
                    {expenseHeadHasTransactions(head.$id) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Cannot delete: has transactions
                      </div>
                    )}
                  </div>
                  {!expenseHeadHasTransactions(head.$id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this expense head?')) {
                          deleteMutation.mutate(head.$id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
