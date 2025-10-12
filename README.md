# ChemStock - Chemical Laboratory Inventory Management

A modern Next.js application for managing chemical and equipment inventory in laboratories, with real-time search powered by PubChem API.

## Features

- 🔐 **Firebase Authentication** - Email/Password and Google Sign-in
- 🔒 **Access Control** - Restrict access to specific authorized users
- 🧪 **Chemical Viewer** - Search chemicals using PubChem API
- 📦 **Inventory Management** - Track chemicals and equipment
- 📊 **Reports** - Generate CSV reports
- 🌙 **Dark Mode** - Theme toggle support
- 📱 **Responsive Design** - Works on all devices

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase setup instructions.

Quick steps:
1. Create Firebase project
2. Enable Email/Password and Google authentication
3. Add authorized users in Firebase Console
4. Copy Firebase config to `.env.local`

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase config and authorized emails.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002)

## Authentication

- Only users listed in `NEXT_PUBLIC_ALLOWED_EMAILS` can access the app
- Users can login with Email/Password or Google
- Unauthorized users are automatically logged out

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login pages
│   ├── (dashboard)/     # Protected dashboard pages
│   └── layout.tsx       # Root layout with AuthProvider
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/               # Utilities and Firebase config
└── hooks/            # Custom React hooks
```

## Tech Stack

- **Next.js 15** - React framework
- **Firebase** - Authentication and future database
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **PubChem API** - Chemical data
- **TypeScript** - Type safety

## License

MIT
