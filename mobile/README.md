# Mini Shop — Mobile App

Cross-platform mobile app built with Expo and React Native.

## Tech Stack

- **Framework:** Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **State Management:** Zustand
- **Auth Storage:** Expo SecureStore
- **API Client:** Axios
- **Database:** Supabase

## Features

- Email & password authentication (login, register, forgot password)
- JWT stored securely in Expo SecureStore
- Product catalogue with search and category filter
- Pull-to-refresh and loading skeletons
- Cart with quantity controls and subtotal
- Order placement via API
- Order history with status badges
- Order detail with progress tracker
- Bottom tab navigation

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

> ⚠️ Use your **local IP address** (not localhost) so your phone can reach the backend.
> Find it by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

### 3. Start the development server

```bash
npx expo start
```

Scan the QR code with **Expo Go** app on your phone.

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Shop screen
│   │   ├── cart.tsx
│   │   ├── orders.tsx
│   │   └── profile.tsx
│   ├── product/[id].tsx    # Product detail
│   ├── order/[id].tsx      # Order detail
│   └── _layout.tsx
├── components/
├── constants/
│   └── theme.ts
├── lib/
│   ├── supabase.ts
│   └── api.ts
└── store/
    ├── authStore.ts
    └── cartStore.ts
```

## Test Credentials

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Customer | customer@minishop.com | customer123 |

## Video Demo

Link to video recording: https://drive.google.com/file/d/1hMfmFNQ2p9g27O4wn4uCeXxl4i3dW2qT/view?usp=drive_link
