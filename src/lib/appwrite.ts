import { Client, Account, Databases, ID, Query } from 'appwrite'
import type { Models } from 'appwrite'

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

// Type definitions - extend Appwrite Document
export type Party = Models.Document & {
  name: string
  town: string
  userId: string
}

export type ExpenseHead = Models.Document & {
  name: string
  category: 'need' | 'wants' | 'pride' | 'unexpected'
  userId: string
}

export type PartyTransaction = Models.Document & {
  partyId: string
  amount: number
  description?: string
  isPaid: boolean
  date: string
  userId: string
}

export type ExpenseTransaction = Models.Document & {
  expenseHeadId: string
  amount: number
  description?: string
  date: string
  userId: string
}

