# Life OS — Personal Operating System

Sistem operasi personal modular yang mengintegrasikan produktivitas, keuangan, pengetahuan, dan pertumbuhan pribadi.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS Custom Properties
- **Components**: shadcn/ui + Custom Component Library
- **Auth**: Supabase Auth
- **State**: Zustand
- **Database**: Prisma ORM

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Setup environment variables

Create `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase Auth

Di Supabase Dashboard → Authentication → Settings:

- **Email Confirmation**: Untuk development, set ke OFF agar bisa langsung login setelah register.
- **Site URL**: Set ke `http://localhost:3000`
- **Redirect URLs**: Tambahkan `http://localhost:3000/**`

### 4. Run development server

```bash
bun dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Dashboard & all modules
│   └── api/                # API routes
├── components/
│   ├── ui/                 # 40+ reusable UI components
│   ├── layout/             # AppShell, Sidebar, Header
│   ├── auth/               # Login & Register forms
│   └── providers/          # Theme provider
├── hooks/                  # useAuth, useMobile, useToast
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   └── utils.ts            # Utility functions
├── stores/                 # Zustand stores (auth, ui)
└── middleware.ts            # Route protection
```

## Sprint Roadmap

| Sprint | Module | Status |
|--------|--------|--------|
| 1 | Foundation (Auth, Shell, Design System) | In Progress |
| 2 | Dashboard (Command Center) | Upcoming |
| 3 | Wealth (Keuangan) | Upcoming |
| 4 | Mission (Tujuan) | Upcoming |
| 5 | Schedule (Jadwal) | Upcoming |
| 6 | Discipline (Habit) | Upcoming |
| 7 | Reflection (Refleksi) | Upcoming |
| 8 | Brain (Ide) | Upcoming |
| 9 | Coach (AI) | Upcoming |
| 10 | Insights (Analitik) | Upcoming |
