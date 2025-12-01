import { Client, Account, Databases, ID, Query } from 'appwrite'

const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || ''
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
const appwriteDatabaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || ''

// Debug logging (remove in production)
console.log('Appwrite Config:', {
  endpoint: appwriteEndpoint ? '✓ Set' : '✗ Missing',
  projectId: appwriteProjectId ? '✓ Set' : '✗ Missing',
  databaseId: appwriteDatabaseId ? `✓ Set (${appwriteDatabaseId.substring(0, 10)}...)` : '✗ Missing',
})

if (!appwriteEndpoint || !appwriteProjectId || !appwriteDatabaseId) {
  console.error(
    '❌ Appwrite credentials not found. Please set VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, and VITE_APPWRITE_DATABASE_ID in your .env file'
  )
  console.error('Current values:', {
    endpoint: appwriteEndpoint || 'MISSING',
    projectId: appwriteProjectId || 'MISSING',
    databaseId: appwriteDatabaseId || 'MISSING',
  })
}

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId)

// Initialize services
export const account = new Account(client)
export const databases = new Databases(client)

// Database ID
export const databaseId = appwriteDatabaseId

// Collection IDs (will be set up in Appwrite console)
export const COLLECTIONS = {
  PARTIES: 'parties',
  EXPENSE_HEADS: 'expense_heads',
  PARTY_TRANSACTIONS: 'party_transactions',
  EXPENSE_TRANSACTIONS: 'expense_transactions',
} as const

// Helper functions
export { ID, Query }

// Type definitions
export type Party = {
  $id: string
  name: string
  town: string
  userId: string
  createdAt: string
}

export type ExpenseHead = {
  $id: string
  name: string
  category: 'need' | 'wants' | 'pride' | 'unexpected'
  userId: string
  createdAt: string
}

export type PartyTransaction = {
  $id: string
  partyId: string
  amount: number
  description?: string
  isPaid: boolean
  date: string
  userId: string
  createdAt: string
}

export type ExpenseTransaction = {
  $id: string
  expenseHeadId: string
  amount: number
  description?: string
  date: string
  userId: string
  createdAt: string
}

