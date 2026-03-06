# HiroReceipt

A lightweight **Order Management & Public Tracking** web app for freelance/joki services. Built to automate invoice generation and allow clients to track job progress in real-time — no login required on the client side.

---

## ✨ Features

- 🔐 **Private Admin Dashboard** — Google OAuth login, restricted to a single admin email
- 📝 **Order Management** — Create, view, edit, and delete orders with custom auto-generated IDs
- 🧾 **Multi-Item Invoice / Receipt** — Supports multiple service items per order, qty, discounts, and subtotals
- 🔄 **Dynamic Title** — Document header shows **INVOICE** or **RECEIPT** automatically based on payment status
- 📦 **Live Public Tracking** — Customers access `/track/[id]` to see status, progress timeline, and delivery links
- 📥 **PDF Download** — Both admin and customer can download the invoice/receipt as PDF
- 🔗 **Conditional Delivery Link** — Google Drive link only revealed to clients upon payment (or admin override)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend / DB**: Firebase (Firestore + Google Auth)
- **PDF**: `html-to-image` + `jsPDF`

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hiroreceipt.git
cd hiroreceipt
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

> Get Firebase config from: Firebase Console → Project Settings → Your Apps → Web App

### 4. Configure Firestore Security Rules

In your Firebase Console → Firestore → Rules, apply the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow get: if true;
      allow list, write: if false;
    }
    match /system/{doc} {
      allow read, write: if request.auth != null
        && request.auth.token.email == "YOUR_ADMIN_EMAIL";
    }
    match /client_counters/{doc} {
      allow read, write: if request.auth != null
        && request.auth.token.email == "YOUR_ADMIN_EMAIL";
    }
  }
}
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — root redirects to `/admin`.

---

## 📁 Project Structure

```
/app
  /admin               → Protected admin pages (dashboard, orders, edit)
  /track/[id]          → Public tracking page
  /unauthorized        → Redirect target for non-admin users
/components
  Invoice.tsx          → Printable Invoice/Receipt component
  StatusBadge.tsx      → Payment & progress badge
  Timeline.tsx         → Public progress timeline
  DeliveryBox.tsx      → Conditional delivery link box
/lib
  firebase.ts          → Firebase client SDK init
/context
  AuthContext.tsx      → Google Auth context provider
```

---

## 📄 License

Personal use. Not open for redistribution.
