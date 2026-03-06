# Swype

A smart personal wardrobe & shopping management web app. Track your closet, discover deals, manage budgets, and never miss a sale again.

**Live Demo:** [tugcegun.github.io/Swype](https://tugcegun.github.io/Swype/)

## Features

- **Digital Wardrobe** — Catalog your clothing items with category, brand, color, season, and price. Search, filter, and manage your entire closet digitally.
- **Deal Radar** — Search for products across Turkish stores in real-time. Track prices, spot discounts, and add items to your cart.
- **Smart Cart** — Add deal items to your cart, select which wallet to pay from, and checkout seamlessly. Purchased items are automatically added to your wardrobe.
- **Multi-Wallet System** — Create multiple wallets for different budgets. Track deposits, withdrawals, and spending per wallet with full transaction history.
- **Reminders** — Set reminders for wardrobe tasks, deals, market visits, or anything else. Supports daily, weekly, and monthly repeats with browser push notifications.
- **Reports & Analytics** — Visualize your spending with 6-month trend charts, category breakdowns, income vs. expense comparisons, and daily averages.
- **Dashboard** — A central hub showing wardrobe stats, active deals, upcoming reminders, wallet balances, and recent items at a glance.
- **Dark Mode** — Full light/dark theme support with smooth transitions.
- **Bilingual** — Complete Turkish and English language support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7 |
| Styling | Tailwind CSS v4 |
| Build | Vite 7 |
| Backend | Firebase (Auth, Firestore, Storage) |
| Product Search | RapidAPI – Real-Time Product Search |
| Icons | Lucide React, LordIcon (Lottie) |
| Deployment | GitHub Pages via GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, and Storage enabled
- (Optional) A RapidAPI key for product search

### Installation

```bash
git clone https://github.com/tugcegun/Swype.git
cd Swype
npm install
```

### Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAPIDAPI_KEY=your_rapidapi_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/       # Reusable UI & feature components
│   ├── cart/         # Cart items, checkout modal
│   ├── deals/        # Deal cards, product search
│   ├── layout/       # Navbar, sidebar, page layout
│   ├── reminders/    # Reminder cards, add modal
│   ├── ui/           # Button, Card, Input, Modal, Logo
│   ├── wallet/       # Wallet cards, add/fund modals
│   └── wardrobe/     # Wardrobe cards, add/edit/detail modals
├── contexts/         # Auth, Theme, Language providers
├── firebase/         # Firebase SDK config
├── hooks/            # useFirestore, useNotifications, useProductSearch
├── i18n/             # English & Turkish translations
├── pages/            # All route pages
└── constants/        # Icon URLs and animation assets
```

## License

This project is for personal and educational use.
