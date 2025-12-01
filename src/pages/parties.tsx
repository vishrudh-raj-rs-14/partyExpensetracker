import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { databases, databaseId, COLLECTIONS, ID, Query, type Party } from '@/lib/appwrite'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2 } from 'lucide-react'

export function PartiesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [town, setTown] = useState('')

  const { data: parties = [], isLoading, error } = useQuery({
    queryKey: ['parties', user?.$id],
    queryFn: async () => {
      if (!user?.$id) {
        console.log('No user ID available')
        return []
      }
      console.log('Fetching parties for user:', user.$id)
      try {
        const response = await databases.listDocuments<Party>(
          databaseId,
          COLLECTIONS.PARTIES,
          [Query.equal('userId', user.$id), Query.orderDesc('$id')]
        )
        // Sort by $createdAt in JavaScript
        const sorted = response.documents.sort((a, b) => {
          const dateA = new Date(a.$createdAt || 0).getTime()
          const dateB = new Date(b.$createdAt || 0).getTime()
          return dateB - dateA // Descending order
        })
        return sorted
        console.log('Parties fetched:', response.documents.length, response.documents)
        return response.documents
      } catch (err: any) {
        console.error('Error fetching parties:', err)
        throw err
      }
    },
    enabled: !!user?.$id,
  })

  // Fetch party transactions to check if parties have transactions
  const { data: partyTransactions = [] } = useQuery({
    queryKey: ['party_transactions', user?.$id],
    queryFn: async () => {
      if (!user?.$id) return []
      const response = await databases.listDocuments(
        databaseId,
        COLLECTIONS.PARTY_TRANSACTIONS,
        [Query.equal('userId', user.$id)]
      )
      return response.documents
    },
    enabled: !!user?.$id,
  })

  // Helper function to check if a party has transactions
  const partyHasTransactions = (partyId: string) => {
    return partyTransactions.some((transaction: any) => transaction.partyId === partyId)
  }

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; town: string }) => {
      if (!user?.$id) throw new Error('User not authenticated')
      console.log('Creating party with userId:', user.$id)
      const result = await databases.createDocument(databaseId, COLLECTIONS.PARTIES, ID.unique(), {
        name: data.name,
        town: data.town,
        userId: user.$id,
      })
      console.log('Party created:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] })
      setName('')
      setTown('')
      toast({
        title: 'Success',
        description: 'Party added successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add party',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await databases.deleteDocument(databaseId, COLLECTIONS.PARTIES, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] })
      toast({
        title: 'Success',
        description: 'Party deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete party',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !town.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }
    createMutation.mutate({ name: name.trim(), town: town.trim() })
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Party</CardTitle>
          <CardDescription>Add a new party to track money exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Party name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="town" className="text-sm font-medium">
                  Town
                </label>
                <Input
                  id="town"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="Town/City"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
          <CardDescription>List of all parties</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-4 text-destructive text-sm">
              Error: {error instanceof Error ? error.message : 'Failed to load parties'}
              <br />
              <span className="text-xs text-muted-foreground">
                Check browser console for details. User ID: {user?.$id || 'Not logged in'}
              </span>
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : parties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parties added yet
              {user?.$id && (
                <div className="text-xs mt-2">
                  User ID: {user.$id.substring(0, 10)}...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {parties.map((party) => (
                <div
                  key={party.$id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{party.name}</div>
                    <div className="text-sm text-muted-foreground">{party.town}</div>
                    {partyHasTransactions(party.$id) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Cannot delete: has transactions
                      </div>
                    )}
                  </div>
                  {!partyHasTransactions(party.$id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this party?')) {
                          deleteMutation.mutate(party.$id)
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
