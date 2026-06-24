// A single point transaction (earn or spend)
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
// 3-HOUR RULE: Points are only credited to balance after 3 hours from created_at,
// even if the task is marked completed earlier.
export interface Task {
  id: string;              // UUID
  title: string;           // e.g. "Finish CS50 problem set"
  pts: number;             // Points to earn on completion
  category?: string;       // e.g. "Study", "Exercise", "Deep Work"
  status: 'pending' | 'completed';
  created_at: string;      // ISO timestamp — the 3-hour window starts here
  completed_at?: string;   // ISO timestamp — when the user marked it done
  // Points are credited at: max(completed_at, created_at + 3h)
  // This is computed, not stored.
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
  is_repeatable?: boolean; // Can be claimed multiple times
}

// App-level settings
export interface Settings {
  daily_goal: number;      // Default: 500
  currency_name: string;   // Default: "pts" (user can rename)
  has_seen_tour?: boolean; // Default: false
}
