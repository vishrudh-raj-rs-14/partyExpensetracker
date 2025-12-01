# Expense Tracker

A mobile-first expense tracking application built with React, TypeScript, and Appwrite. Track money exchanges between parties and categorize expenses by type.

## Features

### Core Functionality
- **Party Management**: Add and manage parties with name and town
- **Expense Head Management**: Create expense categories (Need, Wants, Pride, Unexpected)
- **Party Transactions**: Track money given or received from parties
- **Expense Transactions**: Record expenses by category
- **Reports**: View detailed reports with transaction lists
  - Filter by party, expense head, or both
  - Date range selection
  - Line-by-line transaction details

### Technical Features
- **Mobile-First Design**: Optimized for mobile devices
- **Appwrite Backend**: NoSQL database with permissions
- **Real-time Updates**: Automatic data synchronization
- **Authentication**: Secure user authentication
- **Responsive UI**: Works seamlessly on all screen sizes

## Prerequisites

- Node.js 18+ and npm
- An Appwrite account (free tier works, unlimited time)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Appwrite

1. Create a new project at [appwrite.io](https://appwrite.io) (or use self-hosted)
2. Follow the detailed setup guide in [APPWRITE_SETUP.md](./APPWRITE_SETUP.md)
3. Create `.env` file in project root with your credentials:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components (Button, Input, Card, etc.)
│   │   └── layout/        # Layout components (Navbar)
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/              # Utilities and Appwrite client
│   ├── pages/            # Page components
│   │   ├── login.tsx
│   │   ├── parties.tsx
│   │   ├── expense-heads.tsx
│   │   ├── transactions.tsx
│   │   └── reports.tsx
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── supabase/             # (Not used - using Appwrite instead)
└── package.json
```

## Database Schema

### Collections

- **parties**: Store party information (name, town)
- **expense_heads**: Store expense categories (name, category)
- **party_transactions**: Track money exchanges with parties
- **expense_transactions**: Record expense transactions

See [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) for detailed collection setup instructions.

## Security

- Permissions configured on all collections
- Users can only access their own data (filtered by userId)
- Secure authentication with Appwrite Auth

## Deployment

📖 **Complete deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

### Update Your App

Once deployed, updates are automatic:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel automatically deploys!
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## License

MIT

