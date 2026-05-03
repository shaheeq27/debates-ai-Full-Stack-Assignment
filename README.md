# 🤖 Debales AI — Multi-tenant AI Sales Assistant

A production-grade, multi-tenant AI assistant platform built for the Debales AI internship assignment. Built with Next.js 14 App Router, MongoDB, TypeScript, and a real AI API.

## 🎥 Demo Video
https://www.loom.com/share/fa3adc32f32e448c9a904db13e1555e0

---

## ✨ What Makes This Stand Out

- **Config-driven admin dashboard** — edit one MongoDB document and the dashboard layout changes instantly, no redeploy needed
- **Layered architecture** — Access → Services → Routes → Hooks → UI (strictly enforced)
- **Real AI integration** — Gemini 1.5 Flash with OpenRouter fallback and smart mock fallback
- **Two live integration simulations** — Shopify-style (product/order data) + CRM-style (customer pipeline)
- **Multi-tenant** — projects are fully isolated; users are scoped with roles
- **Dark, futuristic UI** — custom design system, Syne + DM Sans fonts, animated components


---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer  (React + TanStack Query — no direct DB calls) │
├─────────────────────────────────────────────────────────┤
│  Hooks     (TanStack Query mutations & queries)          │
├─────────────────────────────────────────────────────────┤
│  Routes    (Next.js Route Handlers — thin, Zod-validated)│
├─────────────────────────────────────────────────────────┤
│  Services  (Business logic + DB access + AI orchestration│
├─────────────────────────────────────────────────────────┤
│  Access    (Pure authz rules — no I/O, no DB calls)      │
├─────────────────────────────────────────────────────────┤
│  MongoDB   (Mongoose models with Zod-aligned types)      │
└─────────────────────────────────────────────────────────┘
```

### Multi-tenant Model

```
Project (tenant boundary, identified by slug)
  └── Members [{ userId, role: admin|member }]
  └── ProductInstances
        └── integrations [{ type, enabled, config }]
        └── namespace
  └── Conversations (scoped to project + productInstance + user)
        └── Messages
  └── DashboardConfig ← drives admin UI layout
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/debales-ai
cd debales-ai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `AUTH_SECRET` | ✅ Yes | Any random 32+ char string |
| `GEMINI_API_KEY` | ✅ Recommended | Free key from [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `OPENROUTER_API_KEY` | Optional | Fallback AI (free tier at openrouter.ai) |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL (default: http://localhost:3000) |

> **Note:** If neither AI key is set, the app uses a smart mock response system that still demonstrates all features.

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 3 users (Alice admin, Bob admin, Carol member)
- 2 projects (`acme-corp`, `techflow`)
- Product instances with integration configs
- Sample conversations & messages
- **Dashboard config documents** (the config-driven UI source)

The seed output will print the MongoDB `_id` for each user — you'll need these to log in.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → you'll see the login page with seeded user options.

---

## 🔑 Demo Accounts

After seeding, the login page auto-fetches user IDs from MongoDB and displays clickable cards:

| User | Role | Projects | Can access admin? |
|---|---|---|---|
| **Alice Kumar** | Admin | acme-corp, techflow | ✅ Both |
| **Bob Chen** | Admin | acme-corp (admin), techflow (member) | ✅ acme-corp only |
| **Carol Singh** | Member | acme-corp | ❌ No |

---

## 📊 Config-driven Admin Dashboard

**This is the key feature.** The admin dashboard layout is entirely driven by a document in the `dashboardconfigs` MongoDB collection.

### How to verify it (for the Loom video)

1. Log in as Alice → go to `/acme-corp/admin`
2. Open MongoDB Compass (or Atlas UI) → find the `dashboardconfigs` collection
3. Find the document for `acme-corp`
4. **Edit it live:**
   - Change `sections[0].label` from `"Overview"` to `"📊 Analytics"`
   - Remove a section entirely
   - Change a widget's `label`
   - Add a new stat-card widget
5. Refresh the dashboard page → changes appear instantly

### Dashboard config schema

```json
{
  "projectId": ObjectId,
  "title": "My Dashboard Title",
  "sections": [
    {
      "id": "overview",
      "label": "Overview",
      "order": 1,
      "icon": "BarChart3",
      "widgets": [
        {
          "id": "w1",
          "type": "stat-card",
          "label": "Total Conversations",
          "dataKey": "convCount",
          "order": 1
        }
      ]
    }
  ]
}
```

### Widget types

| type | Description |
|---|---|
| `stat-card` | Numeric stat with glow color |
| `integration-status` | Shows enabled/disabled status |
| `toggle-list` | Admin toggles for integrations |
| `message-log` | Recent conversation messages |
| `activity-chart` | Bar chart visualization |

### Data keys for stat-card

| dataKey | What it shows |
|---|---|
| `convCount` | Total conversations in project |
| `msgCount` | Total messages sent |
| `memberCount` | Number of team members |
| `activeUsers` | Users with conversations |

---

## 🔌 Integration Simulations

### Shopify Integration
When enabled, the AI has access to:
- Product catalog with inventory levels
- Recent orders with status
- Revenue metrics

### CRM Integration
When enabled, the AI has access to:
- Customer profiles with spend data
- Sales pipeline stages
- At-risk customer alerts

Toggle integrations from the admin dashboard → they immediately affect AI responses in chat.

---

## 🧱 Project Structure

```
debales-ai/
├── app/
│   ├── [slug]/                   # Dynamic tenant route
│   │   ├── layout.tsx            # Project layout (server auth check)
│   │   ├── chat/
│   │   │   ├── page.tsx          # Chat index (redirects to latest)
│   │   │   ├── new/page.tsx      # Creates new conversation
│   │   │   └── [convId]/page.tsx # Chat UI with message history
│   │   └── admin/
│   │       ├── layout.tsx        # Admin-only server guard
│   │       └── page.tsx          # Config-driven dashboard
│   ├── api/
│   │   ├── auth/                 # login, logout, me, users
│   │   ├── projects/[slug]/      # Project data
│   │   ├── conversations/        # CRUD
│   │   ├── messages/             # Send + fetch (AI flow)
│   │   ├── admin/dashboard/      # Dashboard config API
│   │   ├── integrations/         # Toggle integrations
│   │   └── product-instance/     # Product instance data
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── lib/
│   ├── access/rules.ts           # Pure authz rules (no I/O)
│   ├── auth/session.ts           # Cookie-based session
│   ├── db/
│   │   ├── connect.ts            # MongoDB connection
│   │   └── models/               # Mongoose schemas
│   ├── services/                 # Business logic layer
│   │   ├── ai.service.ts         # Gemini + fallback
│   │   ├── conversation.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── mock-data.ts          # Shopify + CRM mock data
│   │   └── project.service.ts
│   └── zod/schemas.ts            # Validation schemas
│
├── components/
│   ├── Providers.tsx             # TanStack Query provider
│   └── layout/
│       └── ProjectSidebar.tsx
│
├── hooks/index.ts                # All TanStack Query hooks
├── types/index.ts                # Shared TypeScript types
└── scripts/seed.ts               # Database seeder
```

---

## 🛡 Authorization

Authorization is enforced at **two layers**:

1. **Server Components / Layouts** — redirect unauthorized users before rendering
2. **API Route Handlers** — return 401/403 before any data is read

The `lib/access/rules.ts` file contains **pure functions only** — they take already-fetched data and return boolean decisions. No DB calls, no side effects, fully testable.

```typescript
// Example: only admins can access the dashboard
if (!canAccessAdminDashboard(project, user)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 🤖 AI Flow

```
User message → Route Handler (Zod validation)
  → Message Service → Access check
  → Check integration toggles
  → Build context (inject Shopify/CRM mock data if enabled)
  → Try Gemini API → Try OpenRouter → Smart mock fallback
  → Save user + assistant messages
  → Return with steps[] for UI display
```

Rate limit handling: AI calls are wrapped in try/catch. If Gemini quota is exceeded, the system automatically falls back to OpenRouter, then to the smart mock system.

---

## 🚢 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
vercel env add AUTH_SECRET
```

### Docker

```bash
docker build -t debales-ai .
docker run -p 3000:3000 \
  -e MONGODB_URI=your_uri \
  -e GEMINI_API_KEY=your_key \
  -e AUTH_SECRET=your_secret \
  debales-ai
```

---

## 📝 What's Mocked / Assumptions

| Feature | Status | Notes |
|---|---|---|
| Authentication | Stub | Cookie-based, seeded users, no passwords |
| Shopify API | Mocked | Realistic data in `lib/services/mock-data.ts` |
| CRM API | Mocked | Pipeline stages + customer profiles |
| AI API | Real | Gemini 1.5 Flash (free tier) with fallback |
| Real-time updates | Polling | TanStack Query 30s refetch interval |
| File uploads | Not included | Out of scope |

---

## 🧪 Testing

```bash
# Access layer unit test (pure functions)
npx jest lib/access/rules.test.ts

# Zod schema tests
npx jest lib/zod/schemas.test.ts
```

---

## 👤 About

Built by a second-year engineering student as part of the Debales AI internship assignment.

**Tech stack:** Next.js 14 · React 18 · TypeScript · MongoDB + Mongoose · TanStack Query · Zod · Tailwind CSS · Gemini AI
