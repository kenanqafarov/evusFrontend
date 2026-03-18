# 🃏 Wallet — Loyalty Card App

Mobile-first loyalty card wallet. Customers scan a QR code to join a restaurant's program and track their points in one place.

---

## ✨ Features

| | Feature |
|---|---|
| 📱 | Swipeable card carousel with flip animation |
| 📷 | Live camera QR scanner to join programs |
| 🎨 | Per-restaurant card color, dish image & branding |
| 🔐 | Nickname + password auth with JWT |
| 👑 | Admin panel — manage restaurants, issue points |
| 🌐 | Shareable register link & printable QR per restaurant |

---

## 🗂 Project Structure

```
client/
├── src/
│   ├── api/                    # API wrappers (auth, loyalty, restaurants)
│   ├── assets/
│   │   └── styles/
│   │       └── mobiles.css     # Mobile-specific overrides
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── CardEditor.tsx      # Card design form
│   │   ├── NavLink.tsx         # Navigation link
│   │   └── WalletCard.tsx      # Single loyalty card component
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state & JWT handling
│   ├── data/
│   │   ├── mockUsers.ts        # Dev mock data
│   │   └── sampleCards.ts      # Dev sample cards
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Mobile breakpoint hook
│   │   └── use-toast.ts        # Toast notification hook
│   ├── lib/                    # Shared utilities
│   ├── pages/
│   │   ├── Admin.tsx           # Admin panel
│   │   ├── Index.tsx           # Main wallet screen
│   │   ├── Login.tsx           # Sign in / create account
│   │   ├── NotFound.tsx        # 404 page
│   │   ├── Register.tsx        # Customer self-registration
│   │   └── RestaurantQR.tsx    # Printable QR for a restaurant
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
└── vite-env.d.ts
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Set environment variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## 🔑 Auth

- Users register with a **nickname** and **password**
- Admins register using an additional **admin secret** (default: `Admin@1234`)
- JWT token is stored in `localStorage` and attached to every API request
- Admin users are redirected to `/admin` on login

---

## 📱 Pages

### `/` — Wallet
Main screen. Swipeable carousel of all loyalty cards.
- Drag / swipe to navigate between cards
- Tap a card to flip it and show a larger QR for the cashier
- FAB opens the camera scanner to add a new card

### `/login` — Login / Register
Tab-switched form for sign-in and new account creation.

### `/register/:registerLink` — Customer Onboarding
Public page. New customers create an account and join a restaurant's loyalty program in one step. Reached by scanning the restaurant's QR code.

### `/admin` — Admin Panel
Restricted to admin users.

**Restaurants tab** — add, edit, delete restaurants; copy register link; generate QR code; customize card appearance.

**Loyalty Cards tab** — view all customer cards; see points & visits; issue additional points.

### `/qr/:id` — Restaurant QR
Standalone page to view and download the registration QR code for a restaurant.

---

## 📡 API Reference

All requests go to `VITE_API_BASE_URL`.

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login, returns JWT |

### Restaurants
| Method | Path | Description |
|---|---|---|
| `GET` | `/restaurants` | List all |
| `GET` | `/restaurants/:id` | Get one |
| `POST` | `/restaurants` | Create (admin) |
| `PUT` | `/restaurants/:id` | Update (admin) |
| `DELETE` | `/restaurants/:id` | Delete (admin) |

### Loyalty Cards
| Method | Path | Description |
|---|---|---|
| `GET` | `/loyalty/my` | Current user's cards |
| `GET` | `/loyalty/all` | All cards (admin) |
| `POST` | `/loyalty/join` | Join a program |
| `POST` | `/loyalty/:id/issue` | Issue points & visits (admin) |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-router-dom` | UI & routing |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `jsqr` | QR code scanning from camera |
| `qrcode` | QR code generation |
| `sonner` | Toast notifications |
| `@shadcn/ui` | Base UI components |

---

## 📐 Responsive Design

- Cards are sized to **88% of viewport width**, capped at 400px
- Carousel centering is done purely via `translateX` (no padding offsets)
- All inputs use `fontSize: 16px` minimum to prevent iOS auto-zoom
- Touch targets are at least `44×44px`
- Safe area insets (`env(safe-area-inset-*)`) are applied on notch devices
- `100dvh` used for full-height layouts

---

## 🔒 Security Notes

- Change the admin secret via environment variable before deploying
- QR codes contain only the `registerLink` slug — no sensitive data is exposed

---

## 📄 License

MIT
