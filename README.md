<div align="center">

<img src="public/favicon.svg" width="96" height="96" alt="AEON Atelier logo" />

# AEON Atelier

### _Wear Your Style. Create Your Identity._

**A premium, futuristic fashion e‑commerce platform** — cinematic 2026 glassmorphism, an AI style companion, a full customization studio, and an admin console where every business rule is configurable.

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4-2D3748?style=for-the-badge)

![i18n](https://img.shields.io/badge/i18n-5_languages-7b4dff?style=flat-square)
![Currency](https://img.shields.io/badge/currency-MYR_(RM)-12d3e0?style=flat-square)
![Designed in](https://img.shields.io/badge/Designed_in-Malaysia-FDB913?style=flat-square&labelColor=CC0001)
![PRs](https://img.shields.io/badge/PRs-welcome-d4af37?style=flat-square)

</div>

---

> **This is not a demo.** It's a full, production‑shaped storefront: real catalog logic, a persistent cart & orders engine, guest→account conversion rules, coupons, a bulk‑quote pipeline, order tracking, an analytics‑rich admin panel, and five fully‑translated languages — all wired end‑to‑end.

---

## 📑 Table of Contents

- [✨ Highlights](#-highlights)
- [🧭 The NOVA Journey](#-the-nova-journey)
- [🖥️ Feature Tour](#️-feature-tour)
- [🚀 Tech Stack](#-tech-stack)
- [🏁 Getting Started](#-getting-started)
- [🗂️ Project Structure](#️-project-structure)
- [⚙️ Everything Is Configurable](#️-everything-is-configurable)
- [🌐 Internationalization](#-internationalization)
- [📦 Order Lifecycle](#-order-lifecycle)
- [🛠️ Admin Dashboard](#️-admin-dashboard)
- [🎨 Design System](#-design-system)
- [♿ Accessibility & Performance](#-accessibility--performance)
- [🗺️ Roadmap](#️-roadmap)
- [📄 License](#-license)

---

## ✨ Highlights

| | Feature |
|:--:|:--|
| 🪄 | **NOVA** — a friendly 3D‑style shopping companion that guides you from _Discover → Delivery_ |
| 💎 | **2026 glassmorphism UI** — aurora‑violet / cyber‑teal / signature‑gold on a deep void palette |
| 🧵 | **Procedural garments** — every product is rendered as scalable SVG art (zero image assets, infinitely crisp) |
| 🎨 | **Customization Studio** — recolor, restyle and personalize pieces, then save the design to your account |
| 🖐️ | **Fly‑to‑cart** micro‑interaction with an _"Added to your shopping bag"_ confirmation |
| 🔢 | **≥ 5 visual styles per product** — swap signatures live on the card itself |
| 🧠 | **AI‑style recommendations** driven by an interactive style survey |
| 🏷️ | **Coupons, rewards & tiers** — Explorer → Insider → Icon |
| 📦 | **Event / bulk‑order quote pipeline** for corporate & wholesale enquiries |
| 🚚 | **Order tracking** across 7 live stages |
| 📱 | **Mobile‑first** with a sticky bottom nav bar |
| 🌐 | **5 languages** — `EN · BM · VI · 中文 · বাংলা` |
| 🛡️ | **Admin console** — products, orders, customers, marketing, analytics & business rules, all editable |

---

## 🧭 The NOVA Journey

NOVA walks every shopper through a guided, story‑driven flow — with a reduced‑motion mode for accessibility.

```mermaid
flowchart LR
    A([🔍 Discover]) --> B([✨ Style])
    B --> C([🎨 Color])
    C --> D([📏 Size])
    D --> E([🪄 Customize])
    E --> F([🛍️ Cart])
    F --> G([💳 Checkout])
    G --> H([🚚 Delivery])
    style A fill:#7b4dff,stroke:#12d3e0,color:#fff
    style H fill:#d4af37,stroke:#12d3e0,color:#0a0a0f
```

---

## 🖥️ Feature Tour

<details open>
<summary><b>Storefront</b></summary>

- **Cinematic homepage** — hero _"Wear Your Style. Create Your Identity."_ with `SHOP NOW`, `EXPLORE COLLECTION` and `CUSTOMIZE YOUR STYLE`.
- **Product discovery** — full catalog with filtering by collection, category, color, size, price and style.
- **Product cards** — live style/color swapping, quick‑view, wishlist, compare, and the signature fly‑to‑cart.
- **Advanced product page** — gallery, style matrix, size guidance, reviews, and delivery estimates.
- **Intelligent search** & **wishlist** with a dedicated comparison drawer.

</details>

<details>
<summary><b>Personalization</b></summary>

- **Customization Studio** — recolor, restyle, and add elements; save designs to your account and re‑open them later.
- **Interactive style survey** → builds a persistent **Style Profile** (vibe, boldness, formality, fits, colors, budget).
- **AI recommendations** — "picked for you" reasons surface on cards based on the profile.

</details>

<details>
<summary><b>Accounts, Cart & Checkout</b></summary>

- **Accounts** via phone + **OTP** or email, with a 7‑tab dashboard (Profile · Orders · Saved Designs · Wishlist · Addresses · Style Profile · Rewards).
- **Guest checkout** with a **configurable** value threshold that gently nudges high‑value carts toward an account (default ≈ RM 200 — _never hard‑coded_).
- **Futuristic cart** and a **minimal, distraction‑free checkout** with **configurable payment providers**.
- **Delivery** — 1–3 days for in‑stock items, 5–7 days for made / imported‑on‑request pieces.

</details>

---

## 🚀 Tech Stack

| Layer | Choice | Why |
|:--|:--|:--|
| **Framework** | React 18 + TypeScript (strict) | Type‑safe, component‑driven UI |
| **Build** | Vite 5 | Instant HMR, lean production bundles |
| **Routing** | React Router 6 | Lazy‑loaded, code‑split routes |
| **Styling** | Tailwind CSS 3 | Custom design tokens + glassmorphism utilities |
| **Animation** | Framer Motion 11 | Cinematic, spring‑based micro‑interactions |
| **State** | Zustand 4 (+ persist) | Tiny, ergonomic global stores that survive reloads |
| **Charts** | Recharts 2 | Admin analytics (lazy‑loaded only on `/admin`) |
| **Icons** | lucide‑react | Consistent, tree‑shaken icon set |
| **Art** | Hand‑built SVG (`<Garment />`) | Resolution‑independent product rendering |

---

## 🏁 Getting Started

**Prerequisites:** Node.js **18+** and npm.

```bash
# 1. Clone
git clone https://github.com/mamunaio/aeon-atelier.git
cd aeon-atelier

# 2. Install dependencies
npm install

# 3. Start the dev server (http://localhost:5173)
npm run dev
```

**Available scripts:**

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check-safe production build → dist/
npm run preview    # Preview the production build locally
npm run typecheck  # Run the TypeScript compiler (no emit)
```

> 💡 The OTP flow is a deterministic client‑side simulation — the demo code is shown on the sign‑in screen so you can test the full account journey without an SMS provider.

---

## 🗂️ Project Structure

```
aeon-atelier/
├─ public/
│  └─ favicon.svg              # Brand "A" monogram (aurora → cyber gradient)
├─ src/
│  ├─ components/
│  │  ├─ assistant/            # NOVA mascot + guided journey
│  │  ├─ layout/               # Header, Footer, MobileNav, AppShell
│  │  ├─ ui/                   # Reusable bits (Price, Stars, ColorDots…)
│  │  ├─ Garment.tsx           # Procedural SVG garment renderer
│  │  ├─ ProductCard.tsx       # Card w/ live style swap + fly-to-cart
│  │  └─ Section.tsx           # Rails, section headers, category cards
│  ├─ data/                    # Seeded, deterministic product catalog
│  ├─ hooks/                   # useAddToCart, and friends
│  ├─ i18n/                    # 5-language dictionaries + provider
│  ├─ lib/                     # format, seo, rng, helpers
│  ├─ pages/                   # Home, Shop, ProductPage, Customize,
│  │                           # Survey, Events, Cart, Checkout,
│  │                           # OrderTracking, Account, Admin, …
│  ├─ store/                   # Zustand stores (auth, cart, orders,
│  │                           # wishlist, config, ui)
│  └─ types/                   # Shared TypeScript models
├─ index.html
├─ tailwind.config.js          # Design tokens
├─ vite.config.ts              # Manual chunks / code-splitting
└─ tsconfig.json
```

---

## ⚙️ Everything Is Configurable

A core design principle: **business rules live in the admin panel, not in the source.** Nothing critical is hard‑coded.

| Rule | Configurable from Admin → Settings |
|:--|:--|
| 🧾 Guest‑order value threshold | ✅ `guestOrderMaxValue` (no baked‑in number) |
| 🔁 Max guest / per‑customer orders | ✅ |
| 💳 Payment providers | ✅ Toggle, add, and remove — no single provider hard‑wired |
| 🚚 Delivery windows | ✅ In‑stock & special‑order day ranges |
| 🚢 Free‑shipping threshold & flat rate | ✅ |
| 🔐 OTP requirement & fraud checks | ✅ |
| 💱 Currency symbol | ✅ (defaults to `RM`) |
| 🏷️ Coupons & marketing | ✅ Create, toggle, expire |

---

## 🌐 Internationalization

Fully translated UI with a deep English fallback, persisted preference, and per‑language usage analytics surfaced in the admin panel.

<div align="center">

**`EN`  ·  `BM`  ·  `VI`  ·  `中文`  ·  `বাংলা`**

English · Bahasa Melayu · Tiếng Việt · 简体中文 · বাংলা

</div>

---

## 📦 Order Lifecycle

Every order moves through seven trackable stages, reflected live on the tracking page:

```mermaid
flowchart LR
    P([Placed]) --> C([Confirmed]) --> R([Processing]) --> K([Packed]) --> S([Shipped]) --> O([Out for Delivery]) --> D([Delivered])
    style P fill:#7b4dff,color:#fff
    style D fill:#3f9e5e,color:#fff
```

---

## 🛠️ Admin Dashboard

A self‑contained console at `/admin` (rendered outside the storefront chrome) with its own sidebar navigation:

- **Dashboard** — KPI cards (sales, orders, customers, conversion), revenue trend, best‑sellers, catalog composition, popular colors/sizes, and order‑status breakdowns.
- **Products** — searchable table, add‑product form (auto‑builds ≥ 5 styles), stock overrides, archiving.
- **Orders** — status control, one‑click advance, cancellations, and the event/bulk‑quote queue.
- **Customers** — aggregated from orders with lifetime spend & order counts.
- **Marketing** — coupon creation & toggling.
- **Settings** — all business rules + payment providers (see above).
- **Languages** — live translation‑usage analytics.

> Analytics use a seeded, deterministic RNG so charts stay stable across reloads (no flicker, no `Math.random`).

---

## 🎨 Design System

A cohesive, futuristic token set powers the whole UI.

| Token | Hex | Swatch |
|:--|:--|:--:|
| Aurora Violet | `#7b4dff` | 🟣 |
| Cyber Teal | `#12d3e0` | 🩵 |
| Signature Gold | `#d4af37` | 🟡 |
| Void Base | `#0a0a0f` | ⚫ |

- **Display font:** Space Grotesk · **Body:** Inter
- **Surfaces:** layered glassmorphism (`glass`, `glass-strong`, `glass-card`)
- **Motion:** spring easing `cubic-bezier(0.16, 1, 0.3, 1)` with a global reduced‑motion escape hatch

---

## ♿ Accessibility & Performance

- **Reduced‑motion mode** — a global toggle kills animations for motion‑sensitive users.
- **Code‑splitting** — every route is its own lazy chunk; the heavy charts bundle loads **only** on `/admin`.
- **SEO** — per‑page `<title>`/meta via a `useHead` hook.
- **Mobile‑first** — sticky bottom navigation and touch‑friendly targets throughout.
- **No image payload** — garments are SVG, so the catalog stays razor‑sharp and lightweight.

---

## 🗺️ Roadmap

- [ ] Real payment gateway integrations (behind the existing configurable provider layer)
- [ ] Server‑backed auth + SMS OTP delivery
- [ ] Persisted backend for catalog, orders & customers
- [ ] AR "try‑on" preview for the customization studio
- [ ] Automated visual regression tests

---

## 📄 License

This project is a showcase / portfolio build. You're welcome to explore the code for learning and inspiration.

---

<div align="center">

**Designed in Malaysia** 🇲🇾 · Built with React, TypeScript & a lot of glassmorphism.

_Wear Your Style. Create Your Identity._

</div>
