# 🤖 Debales AI — Multi-tenant AI Sales Assistant

A well-structured, multi-tenant AI assistant platform built for the Debales AI internship assignment. Built with Next.js 14 App Router, MongoDB, TypeScript, and a real AI API.

## 🎥 Demo Video
https://www.loom.com/share/fa3adc32f32e448c9a904db13e1555e0

> Demonstrates MongoDB-driven admin dashboard where UI updates instantly after editing the database config.

---

## 🎯 Core Requirement Highlight

The admin dashboard is fully config-driven from MongoDB (dashboardconfigs collection).

- No UI is hardcoded  
- Layout, sections, and widgets are dynamically rendered  
- Editing the MongoDB document updates the UI instantly without redeploy  

This is demonstrated clearly in the demo video.

---

## ✨ What Makes This Stand Out

- Config-driven admin dashboard — edit one MongoDB document and the dashboard layout changes instantly, no redeploy needed  
- Layered architecture — Access → Services → Routes → Hooks → UI (strictly enforced)  
- Real AI integration — Gemini 1.5 Flash with OpenRouter fallback and smart mock fallback  
- Two live integration simulations — Shopify-style (product/order data) + CRM-style (customer pipeline)  
- Multi-tenant — projects are fully isolated; users are scoped with roles  
- Clean UI — custom design system with Tailwind and smooth interactions  

---

## 🏗 Architecture

┌─────────────────────────────────────────────────────────┐ │  UI Layer  (React + TanStack Query — no direct DB calls) │ ├─────────────────────────────────────────────────────────┤ │  Hooks     (TanStack Query mutations & queries)          │ ├─────────────────────────────────────────────────────────┤ │  Routes    (Next.js Route Handlers — thin, Zod-validated)│ ├─────────────────────────────────────────────────────────┤ │  Services  (Business logic + DB access + AI orchestration)│ ├─────────────────────────────────────────────────────────┤ │  Access    (Pure authz rules — no I/O, no DB calls)      │ ├─────────────────────────────────────────────────────────┤ │  MongoDB   (Mongoose models with Zod-aligned types)      │ └─────────────────────────────────────────────────────────┘

---

## 🏢 Multi-tenant Model

Project (tenant boundary, identified by slug)   └── Members [{ userId, role: admin|member }]   └── ProductInstances         └── integrations [{ type, enabled, config }]         └── namespace   └── Conversations (scoped to project + productInstance + user)         └── Messages   └── DashboardConfig ← drives admin UI layout

---

## 🚀 Quick Start

### 1. Clone & Install

bash git clone https://github.com/shaheeq27/debates-ai-Full-Stack-Assignment.git cd debates-ai-Full-Stack-Assignment npm install 

---

### 2. Environment Variables

Copy .env.example to .env and fill in:

bash cp .env.example .env 

| Variable | Required | Description |
|---|---|---|
| MONGODB_URI | ✅ Yes | MongoDB Atlas connection string |
| AUTH_SECRET | ✅ Yes | Any random 32+ char string |
| GEMINI_API_KEY | Optional | Free key from Google AI Studio |
| OPENROUTER_API_KEY | Optional | Fallback AI |
| NEXT_PUBLIC_APP_URL | Optional | Default: http://localhost:3000 |

> If no AI keys are provided, the app uses a mock response system.

---

### 3. Seed Database

bash npm run seed 

Creates:
- Users (admin + member)
- Projects
- Product instances
- Conversations & messages
- Dashboard config (core feature)

---

### 4. Run

bash npm run dev 

Open: http://localhost:3000

---

## 🔑 Demo Accounts

| User | Role | Access |
|---|---|---|
| Alice | Admin | Full access |
| Bob | Admin/Member | Mixed access |
| Carol | Member | No admin |

---

## 📊 Config-driven Admin Dashboard

The admin dashboard is dynamically rendered from MongoDB.

### How to verify:

1. Open /acme-corp/admin
2. Go to MongoDB → dashboardconfigs
3. Edit any field like:

json "label": "Overview" 

Change to:

json "label": "🚀 Analytics" 

4. Refresh → UI updates instantly

---

## 🔌 Integrations

### Shopify (mock)
- Products
- Orders
- Revenue

### CRM (mock)
- Customers
- Pipeline
- Risk analysis

---

## 🛡 Authorization

- Server-side checks enforced  
- Admin routes protected  
- Access rules isolated in pure functions  

---

## 🤖 AI Flow

User → Route → Service → AI → Response

- Controlled via service layer  
- Fallback strategy implemented  

---

## 📁 Project Structure

app/ lib/ components/ hooks/ types/ scripts/

---

## ⚙️ Challenges Faced

- Handled Mongoose model caching issues during seeding  
- Designed flexible MongoDB config schema  
- Maintained strict separation across layers  

---

## 👤 About

Built by a second-year engineering student as part of the Debales AI internship assignment.

Tech Stack: Next.js · TypeScript · MongoDB · Tailwind · TanStack Query · Zod
