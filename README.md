# Cursor Pagination & Snapshot Consistency Lab

An interactive full-stack application demonstrating the solutions to standard pagination challenges—such as performance degradation, data drift, and duplicates—using cursor-based pagination and snapshot consistency.

---

## Key Features

- **Interactive Sandbox Lab**: A React-based visualization interface where you can simulate dynamic real-time operations and browse database catalogs.
- **Dual Pagination Modes**: Direct comparison between traditional `OFFSET` pagination (O(N) search) and modern Cursor pagination (O(log N) search).
- **Snapshot Consistency (Frozen View)**: Keeps the browsing view consistent even when new items are inserted or existing items are updated in real-time.
- **Live SQL Terminal & execution plans**: View the exact SQL statements executed against the database and analyze the Optimizer Explain Plan.
- **Real-time Event Simulator**: Inject background database inserts or random updates and immediately observe how different pagination algorithms respond.

---

## Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, and Motion animations.
- **Backend (Python)**: FastAPI, PostgreSQL (with SQLite fallback), SQLAlchemy 2.0.
- **Database Engine**: Supports PostgreSQL with B-Tree composite indices (`idx_products_updated_id` and `idx_products_category_updated_id`).

---

## Core Concepts Explained

### 1. The Offset Pagination Problem
Using `LIMIT x OFFSET y` forces the database to scan and discard `y` rows. In large tables, this degrades performance to $O(N)$. Furthermore, real-time background insertions push items down, causing duplicates across page loads. Updates push items to different pages, causing users to skip items entirely.

### 2. The Cursor Solution
Cursor-based pagination queries items relative to a unique boundary anchor (e.g., `(updated_at DESC, id DESC)`). Using inequality operators, it jumps directly to the boundary in $O(\log N)$ time, bypassing full-table scans and staying immune to page drift.

### 3. Snapshot Consistency
By anchoring the browsing session to a frozen `snapshot_time`, any background insertions or updates made after the user starts browsing are hidden from the current session.

---

## Project Structure

```text
├── backend/                  # FastAPI python application
│   ├── app/                  # Main database models, schemas, and pagination services
│   ├── tests/                # Self-contained pytest suite for consistency algorithms
│   └── README.md             # Detailed backend documentation and setup guide
├── src/                      # React frontend application
│   ├── App.tsx               # Primary interactive lab interface
│   ├── index.css             # Tailwind theme and custom styling configurations
│   └── main.tsx              # React mounting entrypoint
├── package.json              # Frontend package definitions
└── README.md                 # Project overview and specifications
```

---

## Setup & Running Locally

### 1. Run the Frontend
From the root directory, install dependencies and start the Vite development server:
```bash
npm install
npm run dev
```
The app will be accessible at [http://localhost:3000](http://localhost:3000).

### 2. Run the Backend
For comprehensive backend guides, database seeding instructions, and test executions, please refer to the detailed guide in `/backend/README.md`.
