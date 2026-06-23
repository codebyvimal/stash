# Tally

Tally is a personal **self-gamification and productivity rewards app**.

Turn your daily tasks into a personal economy:
1. **Plan tasks** and assign them a point value.
2. **Complete tasks** to start a 6-hour credit countdown.
3. **Earn points** once the countdown finishes.
4. **Spend points** on real-life rewards you define (watch a movie, play games, buy something, etc.).

Your balance is the live score of your discipline — you only get to enjoy rewards you've earned!

## 🚀 Quick Deploy

You can deploy your own instance of Tally for free using Vercel and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Ftally-app&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

### Backend Setup (Supabase)

To enable cloud sync and multi-device access, you need to set up a Supabase project:

1. Create a free project at [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/schema.sql` from this repository and run it to create your tables and security policies.
4. Go to **Project Settings -> API**.
5. Copy your `Project URL` and `anon public` key.
6. Provide these keys when deploying to Vercel (or add them to your local `.env.local` file).

### Local Storage Mode (No Backend)

If you don't provide Supabase environment variables, Tally will automatically fall back to **Local Storage Mode**.
All your tasks, transactions, and rewards will be saved securely in your browser's local storage. This is perfect for single-device usage without needing to set up any database!

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tally-app.git
   cd tally-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env.local` file using the template:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase keys if you want cloud sync.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Glassmorphism design)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database / Auth:** Supabase (Optional)
- **Deployment:** Vercel

## 📜 License

MIT
