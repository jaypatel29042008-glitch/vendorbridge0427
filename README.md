# VendorBridge — Smart Procurement ERP

A full-stack, multi-tenant procurement management platform built with React + Vite + Zustand + TailwindCSS v4.

## 🚀 Features

- **Multi-tenant architecture** with role-based access (Procurement Officer, Manager, Vendor, Admin)
- **Vendor Registry & Compliance Vetting** — register, verify, suspend vendors
- **RFQ Lifecycle Management** — create, publish, invite vendors
- **Quotation Comparison Engine** — side-by-side comparison with radar chart analysis
- **Gated Approval Workflow** — multi-tier PO approval pipeline
- **PO & Invoice Hub** — purchase orders, GRN tracking, invoice compilation
- **AI-Powered 3-Way Invoice Matching** — OCR simulation with variance detection
- **Compliance-as-Code Engine** — English-language rule compiler
- **Activity Logs & Audit Trail** — full audit timeline with filtering
- **Reports & Analytics** — spend trends, vendor performance, procurement pipeline

## 🛠 Tech Stack

- **React 19** + **Vite 8**
- **TailwindCSS v4** (with @tailwindcss/vite)
- **Zustand 5** (state management)
- **Recharts 3** (data visualizations)
- **React Router DOM 7**
- **Lucide React** (icons)

## 📦 Getting Started

```bash
npm install
npm run dev
```

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Procurement Officer | officer@aeroparts.com | password |
| Manager / Approver | manager@aeroparts.com | password |
| Vendor | vendor@titanium.com | password |
| Admin | admin@aeroparts.com | password |

## 🌐 Live Demo

[https://vendorbridge0427.lovable.app/](https://vendorbridge0427.lovable.app/)

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.jsx          # Sidebar navigation & header
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── VendorRegistry.jsx
│   ├── RfqCreate.jsx
│   ├── QuoteSubmit.jsx
│   ├── QuoteCompare.jsx
│   ├── ApprovalWorkflow.jsx
│   ├── InvoiceHub.jsx
│   ├── ActivityLogs.jsx
│   ├── Reports.jsx
│   ├── AiMatch.jsx
│   └── ComplianceEngine.jsx
├── store.js                 # Zustand global store + mock data
├── App.jsx                  # Router setup
├── main.jsx
└── index.css                # TailwindCSS + design tokens
```

---
Built for phoenix
