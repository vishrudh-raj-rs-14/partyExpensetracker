# Appwrite Setup Guide

This guide will help you set up Appwrite for the Expense Tracker application.

## Step 1: Create Appwrite Account

1. Go to [appwrite.io](https://appwrite.io) and sign up for a free account
2. Create a new project (e.g., "Expense Tracker")

## Step 2: Get Your Credentials

1. In your Appwrite project dashboard, go to **Settings**
2. Copy the following:
   - **Project ID** (you'll need this)
   - **API Endpoint** (usually `https://cloud.appwrite.io/v1` for cloud, or your self-hosted URL)

## Step 3: Create Database

1. Go to **Databases** in the left sidebar
2. Click **Create Database**
3. Name it "ExpenseTracker" (or any name you prefer)
4. Copy the **Database ID** (you'll need this)

## Step 4: Create Collections

Create the following collections in your database:

### Collection 1: `parties`

**Attributes:**
- `name` (String, 255, required)
- `town` (String, 255, required)
- `userId` (String, 255, required)

**Indexes:**
- `userId` (ascending)
- `createdAt` (descending)

**Permissions:**
- Create: Users
- Read: Users (with filter: `userId == {{userId}}`)
- Update: Users (with filter: `userId == {{userId}}`)
- Delete: Users (with filter: `userId == {{userId}}`)

### Collection 2: `expense_heads`

**Attributes:**
- `name` (String, 255, required)
- `category` (String, 255, required) - Enum: `need`, `wants`, `pride`, `unexpected`
- `userId` (String, 255, required)

**Indexes:**
- `userId` (ascending)
- `createdAt` (descending)

**Permissions:**
- Create: Users
- Read: Users (with filter: `userId == {{userId}}`)
- Update: Users (with filter: `userId == {{userId}}`)
- Delete: Users (with filter: `userId == {{userId}}`)

### Collection 3: `party_transactions`

**Attributes:**
- `partyId` (String, 255, required)
- `amount` (Double, required)
- `description` (String, 1000, optional)
- `isPaid` (Boolean, required)
- `date` (String, 255, required) - Format: YYYY-MM-DD
- `userId` (String, 255, required)

**Indexes:**
- `userId` (ascending)
- `partyId` (ascending)
- `date` (descending)

**Permissions:**
- Create: Users
- Read: Users (with filter: `userId == {{userId}}`)
- Update: Users (with filter: `userId == {{userId}}`)
- Delete: Users (with filter: `userId == {{userId}}`)

### Collection 4: `expense_transactions`

**Attributes:**
- `expenseHeadId` (String, 255, required)
- `amount` (Double, required)
- `description` (String, 1000, optional)
- `date` (String, 255, required) - Format: YYYY-MM-DD
- `userId` (String, 255, required)

**Indexes:**
- `userId` (ascending)
- `expenseHeadId` (ascending)
- `date` (descending)

**Permissions:**
- Create: Users
- Read: Users (with filter: `userId == {{userId}}`)
- Update: Users (with filter: `userId == {{userId}}`)
- Delete: Users (with filter: `userId == {{userId}}`)

## Step 5: Configure Authentication

1. Go to **Auth** in the left sidebar
2. Enable **Email/Password** authentication
3. (Optional) Enable **Magic URL** for passwordless login

### Email Verification Settings

**Important:** By default, Appwrite requires email verification. You have two options:

#### Option A: Disable Email Verification (Recommended for Development)

1. Go to **Auth** → **Settings**
2. Find **"Email verification"** or **"Require email verification"**
3. **Disable** email verification
4. This allows users to sign up and immediately use the app without verifying their email

#### Option B: Configure SMTP for Email Delivery (For Production)

If you want to keep email verification enabled, you need to configure SMTP:

1. Go to **Settings** → **Email Delivery** (or **SMTP**)
2. Configure your SMTP settings:
   - **SMTP Host**: Your email provider's SMTP server (e.g., `smtp.gmail.com`)
   - **SMTP Port**: Usually `587` (TLS) or `465` (SSL)
   - **SMTP Username**: Your email address
   - **SMTP Password**: Your email password or app-specific password
   - **Sender Email**: The email address that will send verification emails
   - **Sender Name**: Display name for emails

**Popular SMTP Providers:**
- **Gmail**: `smtp.gmail.com`, Port `587`, requires app-specific password
- **SendGrid**: `smtp.sendgrid.net`, Port `587`
- **Mailgun**: `smtp.mailgun.org`, Port `587`
- **AWS SES**: Varies by region

**Note:** For Appwrite Cloud, email delivery might be pre-configured. Check your project settings.

## Step 6: Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
```

Replace:
- `your_project_id_here` with your Project ID from Step 2
- `your_database_id_here` with your Database ID from Step 3

## Step 7: Update Collection IDs (if different)

If you used different collection names, update them in `src/lib/appwrite.ts`:

```typescript
export const COLLECTIONS = {
  PARTIES: 'your_parties_collection_id',
  EXPENSE_HEADS: 'your_expense_heads_collection_id',
  PARTY_TRANSACTIONS: 'your_party_transactions_collection_id',
  EXPENSE_TRANSACTIONS: 'your_expense_transactions_collection_id',
} as const
```

## Step 8: Test the Setup

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Try signing up/logging in
4. Create a party and expense head
5. Add some transactions

## Troubleshooting

### "Collection not found" error
- Make sure the collection IDs in `COLLECTIONS` match your actual collection IDs
- Collection IDs are case-sensitive

### "Permission denied" error
- Check that permissions are set correctly for each collection
- Make sure you're logged in

### "User not authenticated" error
- Make sure authentication is enabled in Appwrite
- Check that you're using the correct project ID

### "Not receiving verification emails"
- **For Development**: Disable email verification in Auth → Settings
- **For Production**: Configure SMTP settings in Settings → Email Delivery
- Check spam/junk folder
- Verify SMTP credentials are correct
- For Appwrite Cloud, emails should work automatically - check your project email settings

## Appwrite Free Tier

Appwrite Cloud offers:
- **Unlimited projects**
- **Unlimited users**
- **50,000 documents** per project
- **50GB storage**
- **No time limits** - free forever!

For self-hosting, Appwrite is completely open-source and free.

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Console](https://cloud.appwrite.io)
- [Appwrite Discord](https://appwrite.io/discord)

