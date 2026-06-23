# Tally — AI Context Document

> This file is the **single source of truth** for any AI assistant working on this project.
> Read this fully before making any code changes.

---

## 1. What Is Tally?

**Tally** is a personal **self-gamification / productivity rewards app**.

The core loop:
1. You **plan tasks** ahead of time — each task has a title and point value
2. You **mark tasks complete** when done — this starts the 6-hour credit countdown
3. Points are **credited to your balance** after the 6-hour window elapses
4. You **spend points** to claim rewards you've defined (watch a movie, play games, buy something, etc.)
5. Your **balance** is the live score of your discipline — you only get to enjoy rewards you've earned.

Think of it as a personal economy for motivation — part habit tracker, part reward system.

---

## 2. Current State of the Codebase

### Project Structure

```
stash/
├── desktop.html          ← Static HTML mockup (Desktop layout, Tailwind CDN)
├── mobile.html           ← Static HTML mockup (Mobile layout, Tailwind CDN)
├── changeNew.png         ← Reference screenshot of design changes
└── tally-app/            ← The real React/Vite implementation (PRIMARY)
    ├── src/
    │   ├── App.tsx       ← Main component (slim orchestrator, ~80 lines)
    │   ├── App.css       ← App-level styles
    │   ├── index.css     ← Global styles (glassmorphism, scrollbar, fonts)
    │   ├── main.tsx      ← React entry point
    │   ├── types.ts      ← All TypeScript interfaces (Transaction, Task, Reward, Settings)
    │   ├── hooks/
    │   │   └── useStore.ts  ← Main state hook (localStorage, tasks, 6-hour rule)
    │   ├── components/
    │   │   ├── layout/      ← AppShell, Sidebar, MobileNav
    │   │   ├── dashboard/   ← BalanceHeader, TaskPlanner, TaskList, RewardPreview
    │   │   ├── history/     ← HistoryTab, TransactionGroup, TransactionCard
    │   │   └── rewards/     ← RewardsTab, RewardCard, AddRewardModal, ClaimModal
    │   └── lib/
    │       └── utils.ts  ← cn() utility (clsx + tailwind-merge)
    ├── public/           ← Static assets
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| UI Primitives | Radix UI (progress, slot) |
| Utilities | clsx, tailwind-merge |
| Backend (planned) | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting (planned) | Vercel (frontend) + Supabase (backend) |

### Design Language

- **Apple-inspired glassmorphism** — frosted glass panels, white/translucent backgrounds
- **Color palette**: slate-based neutrals, emerald for earn/credited, rose for spend, blue for actions, amber for pending/waiting
- **Typography**: SF Pro / system-ui stack, tight tracking, bold weights
- **Animations**: subtle entry animations, spring physics for tab switching, hover lifts
- **Responsive**: single codebase handles mobile (top nav bar) + desktop (left sidebar)

### What Currently Works

- ✅ App shell renders (responsive desktop sidebar + mobile top nav)
- ✅ Tab switching (Dashboard / Claim / History) with Framer Motion animations
- ✅ Task Planner — add planned tasks with title + points before doing them
- ✅ Task List — displays pending + recently completed tasks with status indicators
- ✅ Mark task complete — tap circle next to task to complete it
- ✅ 6-hour credit rule — points only added to balance after 6h from task creation
- ✅ Pending pts displayed in BalanceHeader with amber clock indicator
- ✅ `useStore` — `localStorage`-backed state with tasks, transactions, rewards
- ✅ Glassmorphism design system (via `index.css` custom classes)
- ✅ Rewards tab with claim flow
- ✅ History tab with date grouping and filters

### What Is Missing / Placeholder

- ❌ History tab — does not yet show completed tasks, only transactions
- ❌ Data persistence for tasks through Supabase (Phase 2)
- ❌ No Supabase integration
- ❌ No user authentication
- ❌ Settings page (lower priority)

---

## 3. Data Model

### Core Types (defined in `src/types.ts`)

```typescript
// A single point transaction (earn or spend — from manual or reward claim)
export interface Transaction {
  id: string;              // UUID
  title: string;           // e.g. "Finished CS50 problem set"
  pts: number;             // Always positive (direction determined by type)
  type: 'earn' | 'spend';
  category?: string;       // e.g. "Study", "Exercise", "Movies", "Games"
  reward_id?: string;      // If type === 'spend', links to the Reward claimed
  task_id?: string;        // If type === 'earn', links to the Task completed
  created_at: string;      // ISO timestamp
}

// A planned task that earns points when completed
// ⏱ 6-HOUR RULE: Points are credited at max(completed_at, created_at + 6h)
export interface Task {
  id: string;              // UUID
  title: string;           // e.g. "Finish CS50 problem set"
  pts: number;             // Points to earn on completion
  category?: string;       // e.g. "Study", "Exercise", "Deep Work"
  status: 'pending' | 'completed';
  created_at: string;      // ISO timestamp — the 6-hour window starts here
  completed_at?: string;   // ISO timestamp — when user marked it done
}

// A reward the user has defined
export interface Reward {
  id: string;              // UUID
  title: string;           // e.g. "Movie Marathon Weekend"
  description?: string;    // Optional short description
  pts: number;             // Cost in points
  category: string;        // e.g. "Movies", "Games", "Food", "Tech"
  image_url?: string;      // Optional image (Unsplash URL or user-provided)
  created_at: string;      // ISO timestamp
}

// App-level settings
export interface Settings {
  daily_goal: number;      // Default: 500
  currency_name: string;   // Default: "pts" (user can rename)
}
```

### Derived State (computed in `useStore`, not stored)

```typescript
// Credit time for a completed task:
// Points credited at: max(completed_at, created_at + 6h)
function getCreditTime(task: Task): string { ... }

// Whether a completed task's points have been credited yet:
function isCredited(task: Task): boolean {
  return new Date(getCreditTime(task)).getTime() <= Date.now();
}

// Balance = sum of earn transactions + sum of credited task pts - sum of spend pts
const creditedTaskPts = tasks.filter(isCredited).reduce((acc, t) => acc + t.pts, 0);
const balance = transactions.reduce(...) + creditedTaskPts;

// Pending pts = completed tasks not yet past their credit time
const pendingPts = tasks
  .filter(t => t.status === 'completed' && !isCredited(t))
  .reduce((acc, t) => acc + t.pts, 0);

// Daily earned = today's credited earn transactions + today's credited tasks
const dailyEarned = ...;
```

---

## 4. Business Rules (DO NOT VIOLATE)

### 4.1 Task Lifecycle

1. User **plans a task** (title + pts) → `status: 'pending'`, `created_at` recorded
2. User **marks task complete** → `status: 'completed'`, `completed_at` recorded
3. **6-hour credit rule**: Points are only added to balance at `max(completed_at, created_at + 6h)`
   - If completed after 6h have elapsed → credited immediately on completion
   - If completed within 6h of creation → credited at exactly `created_at + 6h`
4. The app **ticks every minute** (`setInterval`) to re-evaluate which tasks have crossed the credit threshold
5. Tasks can be **deleted** at any time (points not credited if deleted before credit time)
6. Tasks cannot be un-completed once marked done

### 4.2 Balance Integrity

- **Displayed balance** always reflects only credited points (not pending)
- **Pending pts** shown separately in amber color with clock icon in BalanceHeader
- Never show pending pts as part of the balance total

---

## 5. Storage Strategy

### Phase 1: localStorage (No Backend — Default for Everyone)

- Store `transactions`, `tasks`, `rewards`, and `settings` in `localStorage`
- Key: `tally_data` → single JSON blob: `{ transactions: [], tasks: [], rewards: [], settings: {} }`
- Any user can self-host by cloning the repo and running `npm run build` — no server needed
- No login required — single-user personal use

### Phase 2: Supabase (Optional Cloud Sync + Multi-device)

- Users who want multi-device sync can connect their own Supabase project
- The app detects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the environment
- If env vars are present → use Supabase; otherwise → fall back to localStorage automatically
- **Self-hosters**: create a free Supabase project, copy keys into `.env.local`, deploy `/dist`
- **Vercel-hosted version**: env vars set via Vercel dashboard; shared Supabase instance + Auth

### Environment Variables (`.env.local`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both are **optional** — app must be fully functional without them.

### Supabase SQL Schema

Run this in the Supabase SQL Editor to set up tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tasks (planned work items)
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  pts integer not null check (pts > 0),
  category text,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Rewards catalog (must be created before transactions due to FK)
create table rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  pts integer not null check (pts > 0),
  category text not null default 'Other',
  image_url text,
  created_at timestamptz default now()
);

-- Transactions (earn and spend events — manual or reward claims)
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  pts integer not null check (pts > 0),
  type text not null check (type in ('earn', 'spend')),
  category text,
  reward_id uuid references rewards(id),
  task_id uuid references tasks(id),
  created_at timestamptz default now()
);

-- Row Level Security
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table rewards enable row level security;

create policy "Users manage own tasks" on tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own transactions" on transactions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own rewards" on rewards
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 6. Feature Specifications

### 6.1 Dashboard Tab

**Balance display** (`BalanceHeader`)
- Large prominent number, formatted with commas (`toLocaleString()`)
- Animate (count up/down) when balance changes
- Shows unit suffix from `settings.currency_name`
- **Amber pending indicator** — if any completed tasks haven't cleared the 6-hour window,
  show `+N pts pending (crediting soon)` in amber with a clock icon

**Task Planner** (`TaskPlanner` — replaces old QuickAddForm)
- Two inputs: task title (text, required) + points (number, required, min 1)
- Submit on Enter key or clicking the `+` button
- On submit: create a `Task` with `status: 'pending'`, do NOT touch balance yet
- Show hint: "Points credited 6 hours after task creation" when inputs are filled
- Clear inputs after submission

**Task List** (`TaskList`)
- Shows all pending tasks + last 3 recently completed tasks
- **Pending tasks**: circle icon → click to mark complete → starts 6h window
- **Completed (pending credit)**: amber `CheckCircle2` icon + "Xh Ym to credit" badge
- **Completed (credited)**: emerald `CheckCircle2` icon + "Credited ✓" badge
- Each row: title (strikethrough when done), pts badge, delete (trash) icon on hover
- Empty state: "No tasks yet — plan one above ↑"

**Daily Goal widget** (desktop only, top-right corner)
- Shows: `dailyEarned / settings.daily_goal`
- Progress bar fills dynamically based on credited earn points today

**Up Next / Available Rewards section** (`RewardPreview`)
- Top 2 rewards sorted: unlocked first (balance >= pts), then closest to unlocking
- Unlocked: blue "Claim Reward" button → triggers claim flow
- Locked: shows progress bar + "Need X more pts"

---

### 6.2 History Tab (exists — needs task entries added)

**Layout**
- Full-height scrollable list inside the main panel
- Grouped by date: "Today", "Yesterday", then "Jun 20", "Jun 19", etc.
- Each group: a styled date label header, then transaction cards below

**TODO**: Include completed tasks in History view, not just transactions.

**Transaction Card**
- Icon: emerald checkmark (earn) or category icon in rose (spend)
- Title + optional category tag pill
- Timestamp: relative when recent ("2 hours ago"), absolute when older ("Jun 20 at 3:45 PM")
- Points badge: `+500` in emerald or `-150` in rose

**Filter Bar**
- Three pill-style filter tabs at top: `All` · `Earned` · `Spent`
- Filters the rendered list

---

### 6.3 Rewards / Claim Tab (exists)

**Catalog view**
- Responsive grid: 2 columns on mobile, 3 columns on desktop
- Each card: background image (or category-colored gradient fallback), title, cost badge, category label
- Status: green "Unlocked" dot if `balance >= reward.pts`; dimmed/grey if locked

**Claim flow**
- Tap "Claim" on an unlocked reward → confirmation modal
- Modal: reward name, cost, "Are you sure?" message
- Buttons: Cancel / Confirm
- On confirm: create `Transaction` of type `'spend'`, deduct pts, close modal, show toast

**Add Reward form** (floating `+` button → modal)
- Fields: Title (required), Cost in pts (required, min 1), Category (dropdown + custom), Description (optional), Image URL (optional)
- On submit: persist new `Reward`, appears in catalog immediately

---

### 6.4 Settings Page (future, lower priority)

- Edit daily goal amount
- Rename currency unit (e.g., "pts" → "gold" → "XP")
- View Supabase connection status (connected / localStorage mode)
- Export data as JSON download
- Clear all data (with confirmation dialog)

---

## 7. Component Architecture

```
src/
├── types.ts                       ← All TypeScript interfaces/types
├── hooks/
│   ├── useStore.ts                ← Main state hook (tasks, transactions, rewards, settings)
│   │                                 Exports: getCreditTime(), isCredited()
│   └── useSupabase.ts             ← Supabase-specific data layer (optional, Phase 2)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           ← Outer container, decorative orbs, glassmorphism bg
│   │   ├── Sidebar.tsx            ← Desktop left sidebar with nav
│   │   └── MobileNav.tsx          ← Mobile top nav bar
│   ├── dashboard/
│   │   ├── BalanceHeader.tsx      ← Balance display + pending pts + daily goal widget
│   │   ├── TaskPlanner.tsx        ← Plan task form (title + pts → add pending task)
│   │   ├── TaskList.tsx           ← Pending + recent completed tasks with credit status
│   │   └── RewardPreview.tsx      ← "Up Next" top 2 rewards on dashboard
│   ├── history/
│   │   ├── HistoryTab.tsx         ← Full history tab view
│   │   ├── TransactionGroup.tsx   ← Date group header + item list
│   │   └── TransactionCard.tsx    ← Single transaction row
│   ├── rewards/
│   │   ├── RewardsTab.tsx         ← Full rewards catalog tab
│   │   ├── RewardCard.tsx         ← Single reward card
│   │   ├── AddRewardModal.tsx     ← Create/edit reward form modal
│   │   └── ClaimModal.tsx         ← Spend confirmation modal
│   └── ui/
│       ├── Toast.tsx              ← Success/error notification
│       ├── Modal.tsx              ← Base modal wrapper with backdrop
│       └── ProgressBar.tsx        ← Animated progress bar (Framer Motion)
├── App.tsx                        ← Slim orchestrator — routes between tabs only
├── index.css                      ← Global styles, glassmorphism design tokens
└── main.tsx                       ← React entry point
```

---

## 8. State Management Hook Design

`useStore` is the **only** place data is read or mutated. All components call this hook — no prop drilling.

```typescript
// src/hooks/useStore.ts

export function getCreditTime(task: Task): string // max(completed_at, created_at + 6h)
export function isCredited(task: Task): boolean   // credit time has elapsed

export function useStore() {
  return {
    // Data
    transactions: Transaction[],
    tasks: Task[],
    rewards: Reward[],
    settings: Settings,

    // Derived (computed, not stored)
    balance: number,           // sum(credited task pts) + sum(earn txns) - sum(spend txns)
    pendingPts: number,        // sum of completed task pts NOT yet past credit time
    dailyEarned: number,       // today's credited earn total

    // Task Mutations
    addTask:      (t: Omit<Task, 'id' | 'created_at' | 'status' | 'completed_at'>) => void,
    completeTask: (taskId: string) => void,   // marks done + records completed_at
    deleteTask:   (taskId: string) => void,

    // Transaction Mutations
    addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => void,
    addReward:      (r: Omit<Reward, 'id' | 'created_at'>) => void,
    updateReward:   (id: string, updates: Partial<Reward>) => void,
    deleteReward:   (id: string) => void,
    claimReward:    (rewardId: string) => void,  // creates a 'spend' transaction
    updateSettings: (s: Partial<Settings>) => void,
    clearAll:       () => void,
  };
}
```

Internally: `useState` + `useEffect` to sync with localStorage on every change.
A `setInterval` (1 min) triggers re-renders so credit windows auto-resolve without user action.

---

## 9. Self-Hosting Guide

### Option A: Pure Frontend (localStorage only — no backend)

```bash
git clone <repo-url>
cd tally-app
npm install
npm run build
# Deploy the /dist folder anywhere:
# Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.
```

Data lives in the browser's localStorage. Zero cost, zero server, zero accounts.

### Option B: With Supabase (cloud sync + auth)

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the full schema from Section 5
3. Go to Project Settings → API → copy `Project URL` and `anon public` key
4. Create `.env.local` in the `tally-app` root:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. `npm run build` → deploy `/dist` to Vercel (or any host)
6. Set those same env vars in your host's dashboard

### Option C: One-Click Vercel Deploy (future — add to README)

A "Deploy to Vercel" button will be added.

---

## 10. Recommended Build Order

| # | Task | Key Files |
|---|------|-----------|
| 1 | ✅ Define TypeScript types (incl. Task) | `src/types.ts` |
| 2 | ✅ Build `useStore` with localStorage + task + 6h rule | `src/hooks/useStore.ts` |
| 3 | ✅ Build TaskPlanner + TaskList dashboard components | `components/dashboard/` |
| 4 | ✅ Wire pending pts into BalanceHeader | `BalanceHeader.tsx` |
| 5 | Add completed tasks to HistoryTab | `components/history/` |
| 6 | Build Rewards catalog (claim flow) | `components/rewards/` |
| 7 | Toast notification system | `components/ui/Toast.tsx` |
| 8 | Dynamic Daily Goal + celebrate animation | `BalanceHeader.tsx` |
| 9 | Supabase adapter (optional, Phase 2) | `src/hooks/useSupabase.ts` |
| 10 | Auth flow for Supabase mode (optional) | New auth components |
| 11 | Full README with hosting guide | `README.md` |

---

## 11. Design Constraints (DO NOT VIOLATE)

- **Do NOT** change the glassmorphism design language — it is the visual identity of Tally
- **Do NOT** switch CSS frameworks — Tailwind CSS v3 is already configured
- **Do NOT** remove Framer Motion — all state transitions and animations must use it
- **Keep** the dual responsive layout: sidebar on desktop (`md:`), top nav on mobile
- **Follow** the color convention strictly:
  - `emerald` → earn / credited / positive / success
  - `rose` → spend / negative / error / destructive
  - `blue` → primary CTA actions (claim, add, confirm)
  - `slate` → neutral UI chrome, labels, backgrounds
  - `amber` → pending / waiting / 6-hour countdown (tasks not yet credited)
- All interactive elements must have hover states and `transition-all`
- The app must feel **premium** at all screen sizes — never ship MVT-quality UI
- Animations should be subtle and purposeful — not distracting

---

## 12. First-Run Seed Data

When the app is opened for the first time (empty localStorage), automatically seed:

**Default Rewards:**
```typescript
[
  { title: "Movie Night", pts: 300, category: "Movies", description: "Watch any movie you want" },
  { title: "1 hr Gaming", pts: 500, category: "Games", description: "Guilt-free gaming session" },
  { title: "Takeout Meal", pts: 800, category: "Food", description: "Order your favourite food" },
  { title: "Buy a Book", pts: 1000, category: "Learning", description: "Treat yourself to a new book" },
  { title: "Weekend Movie Marathon", pts: 1500, category: "Movies", description: "Full day of movies" },
  { title: "New PS5 Game", pts: 6000, category: "Games", description: "Buy a brand new game" },
]
```

**Default Settings:**
```typescript
{ daily_goal: 500, currency_name: "pts" }
```

No seed transactions or tasks — the user starts with a clean slate (balance = 0).

---

## 13. Known Issues / Technical Debt

| Issue | Impact | Location |
|-------|--------|----------|
| History tab doesn't show completed tasks | Tasks invisible in history | `HistoryTab.tsx` |
| `useStore` ticks every 60s but credit resolution isn't sub-minute precise | Off by up to 1 minute | `useStore.ts` |
| Reward images use Unsplash URLs | May expire or break | `RewardPreview.tsx`, `RewardCard.tsx` |
| Daily Goal (300/500) is hardcoded in default seed | Not user-configurable yet | `useStore.ts` |
| Settings nav item is not linked anywhere in nav | Dead UI element | Sidebar |

---

*Last updated: June 2026*
*Maintained by: Vimal*
