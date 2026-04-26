# Mini Shop — Admin Dashboard

Web admin dashboard built with React, Vite, and Tailwind CSS.

## Tech Stack

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Axios
- **Notifications:** Sonner
- **Auth:** Supabase (via backend API)

## Features

- Admin-only login (customer accounts are rejected)
- Dashboard with KPI cards (orders today, revenue, active products, total orders)
- Products table with create, edit, toggle active
- Orders table with status filter, inline status update, order detail panel
- Loading skeletons on all pages
- Toast notifications on all actions
- Responsive sidebar navigation

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000
```

### 3. Start the development server

```bash
npm run dev
```

Dashboard opens at `http://localhost:5173`

## Project Structure

```
dashboard/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   └── Orders.tsx
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── store/
│   │   └── authStore.ts
│   └── App.tsx
└── index.html
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@minishop.com | admin123 |

> ⚠️ Only admin accounts can access the dashboard. Customer accounts will be rejected at login.

## Video Demo

Link to video recording: https://drive.google.com/file/d/1hMfmFNQ2p9g27O4wn4uCeXxl4i3dW2qT/view?usp=drive_link
