# DOKA E‑commerce Platform

Full-stack e‑commerce site: **React (Vite) + TypeScript** frontend and **Node.js + Express + Prisma (SQLite)** backend. Everything is wired so you can run and manage the site (carousel, products, categories) from one place.

---

## Quick start

### 1. Install and set up backend (database + API)

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
```

Seed creates an admin user and sample categories, products, and hero slides.

### 2. Install frontend

```bash
# from project root
npm install
```

### 3. Run everything

**Option A – One command (frontend + backend):**

```bash
npm run dev:all
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:3001**

**Option B – Two terminals:**

- Terminal 1: `npm run dev` (frontend)
- Terminal 2: `npm run dev:api` (backend)

---

## Environment

| Where       | File / variable   | Purpose |
|------------|-------------------|--------|
| **Root**   | `.env` or `.env.example` | `VITE_API_URL=http://localhost:3001/api` (frontend API base URL) |
| **Backend** | `backend/.env`   | `DATABASE_URL`, `JWT_SECRET` (see `backend/.env.example`) |

---

## Managing the website (Admin)

1. Open the site (e.g. http://localhost:5173).
2. Type **`admin`** on the keyboard (anywhere) to open the Admin panel.
3. Log in:
   - Email: **admin@doka.com**
   - Password: **admin123**

### What you can manage

| Tab          | What it does |
|-------------|----------------|
| **Products** | Add / edit / delete products. Set name, description, price, category, brand, images (comma‑separated URLs), stock, Trending, Featured. |
| **Hero**     | **Carousel on the home page.** Load current slides, add/remove slides, set for each: Image URL, Title, Subtitle, CTA button text, and **Link** (product ID so “Shop now” opens that product). Save to update the live carousel. |
| **Categories** | Add / edit / delete categories. Slug (URL‑friendly id), name, image URL. Products use category slug (e.g. `headphones`). |

- **Hero link:** Use the product’s **ID** from the Products table (e.g. copy from the product row). That ID is what the carousel CTA uses to open the product page.
- **Product images:** In admin, enter multiple image URLs separated by commas; the product page will show a main image and thumbnails.

---

## How backend and frontend work together

| Feature        | Backend (API)        | Frontend |
|----------------|----------------------|----------|
| **Hero carousel** | `GET /api/hero` (public), `PUT /api/hero` (admin) | Home page loads slides from API; Admin “Hero” tab saves via `PUT /api/hero`. |
| **Products**   | `GET/POST/PUT/DELETE /api/products` | Products list, product page, search; Admin products tab uses create/update/delete. |
| **Categories** | `GET/POST/PUT/DELETE /api/categories` | Home filters, category pages, Admin categories tab. |
| **Auth**       | `POST /api/auth/login`, JWT          | Admin login; token stored and sent in `Authorization` for admin requests. |

Frontend API base URL is set by **`VITE_API_URL`** (default `http://localhost:3001/api`). Backend runs on port **3001** by default.

---

## Project layout

```
.
├── src/                    # Frontend (React + Vite)
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/     # HomePage, ProductPage, AdminPage, HeroCarousel, etc.
│   ├── api/                # API client (products, categories, hero, auth, orders)
│   ├── hooks/              # useApi (useProducts, useCategories, useHero, useProduct)
│   ├── context/            # AuthContext
│   └── types/
├── backend/
│   ├── src/
│   │   ├── index.ts        # Express app, CORS, routes
│   │   ├── routes/         # auth, categories, products, orders, hero
│   │   └── middleware/     # auth (JWT, admin)
│   └── prisma/
│       ├── schema.prisma   # User, Category, Product, Order, HeroSlide
│       └── seed.ts        # Categories, products, admin user, hero slides
├── package.json            # Frontend scripts: dev, dev:api, dev:all, build
└── README.md               # This file
```

---

## Troubleshooting

- **“Could not load products” / API errors**  
  Ensure the backend is running: `cd backend && npm run dev`. You should see `API running at http://localhost:3001`. Frontend must use the same API URL as in `VITE_API_URL`.

- **Port 3001 in use**  
  Stop the process using 3001 or use another port via `PORT=3002` in `backend/.env` (and adjust `VITE_API_URL` if needed).

- **Hero or products don’t update**  
  After saving in Admin, the frontend refetches; if you don’t see changes, refresh the page. For hero, ensure you clicked “Save Hero” and that you’re logged in as admin.

- **Carousel CTA doesn’t open the right product**  
  In Admin → Hero, set **Link** to the product’s **ID** (from the Products table), not the name or slug.

---

## Build for production

```bash
npm run build          # Frontend build in dist/
cd backend && npm run build   # Backend (if you use tsc)
```

Set `VITE_API_URL` to your production API URL before building the frontend.
