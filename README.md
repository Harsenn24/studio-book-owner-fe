# StudioSpace — Owner Dashboard

A Vue 3 single-page application that lets band-rehearsal studio owners onboard their business, list rooms for rent, track incoming bookings, and withdraw their earnings to a bank account.

This is the **owner-facing** frontend of a larger studio-booking platform. It talks to a REST backend (`studio-book-be`) and covers the full owner lifecycle: sign-up → verification → business submission → approval → room setup → subscription payment → transaction monitoring → payout.

> The UI copy is in Bahasa Indonesia, since the product targets the Indonesian market (Indonesian address hierarchy, IDR currency, QRIS payments, local bank transfer rails).

---

## Table of contents

- [Feature highlights](#feature-highlights)
- [Tech stack](#tech-stack)
- [Screens & routes](#screens--routes)
- [Architecture](#architecture)
- [Notable implementation details](#notable-implementation-details)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Backend contract](#backend-contract)
- [Roadmap](#roadmap)

---

## Feature highlights

### Authentication & onboarding
- Combined login / register form with a single toggle, inline password reveal, and full-screen loading lock to prevent double submission.
- Email-verification flow: the backend mails a tokenised link, the app consumes it at `/verify/owner/:uuid`, exchanges the token, and stores the session.
- Re-send handling — if the backend replies `Verification email re-sent` or `Email has been limited`, the UI surfaces a dedicated modal instead of a generic error.

### Studio submission (the heavy form)
A 700-line modal that captures everything the platform needs to approve a new business:

- **Cascading address autocomplete** across the five levels of the Indonesian administrative hierarchy — Province → City → District → Village → Postal Code. Selecting a level resets every level below it and refetches the next one, so the form can never submit an inconsistent address.
- **Bank picker** backed by a searchable bank list, storing the PRIMA network code rather than a display name.
- **Document uploads** (owner ID card + two studio photos) with a 500 KB client-side size guard, instant `URL.createObjectURL` preview, and per-file error slots. Files upload immediately to `owner/file/upload` and the returned `file_id`s are collected for the final submission payload.
- **Input normalisation** — studio and contact names are title-cased on the fly, phone numbers are stripped to digits and validated against the Indonesian `08…` format with length bounds, and account numbers reject non-numeric input.
- Submission status is then tracked on its own page (`pending` / `accepted` / `rejected`) with the reviewer's notes.

### Studio management
- Paginated, searchable studio list with server-driven `maxPage` / `totalData`, live status badges, and deep links to Google Maps.
- A pulsing notification card appears on the dashboard whenever a submission is awaiting review.
- Per-studio detail view organised into four tabs: **Profile**, **Subscription transactions**, **Rental transactions**, and **Withdrawals**.

### Room ("studio number") configuration
One page serves both create and edit modes, branching on whether `:studio_number_uuid` is present in the route:

- Per-instrument equipment counters seeded from the catalogue (create) or from existing quantities (edit).
- Separate weekday / weekend pricing.
- **Operating hours** entered row by row, with `open < close` validation, duplicate-date prevention (each date can only be used once, and already-used dates are filtered out of the remaining dropdowns), and a guard that blocks adding a new row until the current one is complete.
- **Bulk schedule import** — download an Excel template from the backend, fill it in, upload it, and the rows hydrate the operating-hours table in one shot.
- Cover-photo replacement with preview before commit.

### Subscription payment (QRIS)
- Fetches the current subscription price and duration, then computes and displays the activation and expiry dates in Indonesian locale format.
- Reuses an outstanding QR if one already exists (`qr/check`) instead of minting a duplicate charge; otherwise creates a new one.
- Renders the QR client-side with `qrcode.vue` and runs **two independent timers**: a 3-second poll against the payment-status endpoint, and a 1-second countdown to QR expiry.
- Both intervals are torn down on success, on expiry, on modal close, and in `onUnmounted` — no orphaned pollers.

### Money out: reconciliation & disbursement
The withdrawal tab is the most business-critical screen:

- Balance panel split into total transactions, gross amount, **pending reconciliation**, and already-disbursed funds.
- A reconciliation trigger that settles eligible rental transactions into withdrawable balance.
- Withdrawal input with live rupiah formatting, a keystroke filter, a Rp 50,000 minimum, and a `computed` validity check that accounts for the admin transfer fee on top of the requested amount (`amount + fee ≤ available balance`), with a distinct message for "below minimum" versus "insufficient balance".
- **Two-step transfer** mirroring real banking rails: an *inquiry* call resolves and displays the destination account holder's name for confirmation, and only then is the *transfer* executed — so the owner sees who they are paying before the money moves.
- Editable payout bank account, and a filterable, paginated disbursement history (date range, status, transaction ID).

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Routing | Vue Router 4 (HTML5 history mode) |
| HTTP | Axios |
| QR rendering | `qrcode.vue` |
| Misc | `uuid` (request IDs), `dayjs` |

No component library — every card, modal, tab bar, dropdown, and table is hand-built with Tailwind utilities.

---

## Screens & routes

| Route | Screen | Purpose |
| --- | --- | --- |
| `/login` | `LoginPage` | Login + register in one toggleable form |
| `/verify/owner/:uuid` | `VerifyEmailPage` | Consumes the email-verification token |
| `/home` | `HomePage` | Studio list, search, pagination, submission banner |
| `/home/submission-status/:submission_uuid` | `SubmissionStatusPage` | Review status and reviewer notes |
| `/home/:studio_uuid` | `StudioDetailPage` | Tabbed detail: profile, subscriptions, rentals, withdrawals |
| `/home/create-studio-detail/:studio_uuid` | `CreateStudioDetailPage` | Create a new room |
| `/home/:studio_uuid/:studio_number_uuid` | `CreateStudioDetailPage` | Edit an existing room (same component, edit mode) |

---

## Architecture

```
src/
├── api/                 # every backend call, grouped by domain
│   ├── http.js          #   one Axios instance: headers, envelope, error messages, 401 handling
│   ├── auth.js  studio.js  funding.js  master.js (regions, dates/hours, file uploads)
├── composables/         # useSession, useToast, useOwnerOverview (submission + studio count), usePagedList
├── utils/format.js      # price/date/epoch formatting, status labels, equipment icons
├── components/
│   ├── layout/          # AppLayout (navbar + "Tambah Studio"), AuthLayout (hero split)
│   ├── ui/              # buttons, inputs, modal, sheet, autocomplete, image upload, pagination, filters, stat card…
│   ├── auth/            # verification e-mail notices
│   ├── studio/          # submission form + status, studio card, profile tab, subscription modal
│   └── funding/         # subscription / rent / withdrawal tabs, transfer & bank modals
├── pages/               # one file per route
└── router/index.js      # lazy routes + auth guard (paths unchanged)
```

**One HTTP client.** `api/http.js` attaches `Authorization`, `x-device-id` (persistent per browser), `x-ip-address` (resolved once per tab, `0.0.0.0` if ipify is blocked) and a fresh `x-request-id` to every call. 4xx answers are read as the `{ status, message, data }` envelope, validation arrays are joined and known backend messages are translated for the owner. A 401 clears the session and returns to `/login`.

**Auth in the router.** Every `/home…` route has `meta.requiresAuth`; one `beforeEach` guard redirects to `/login?redirect=…`.

**Shared list logic.** The three transaction tabs use `usePagedList`: debounced filters reset to page 1, pagination uses the API totals, and stale responses are discarded. Tables become cards on phones.

**Responsive shell.** Desktop gets wide grids, sticky summaries and dialogs; phones get full-screen sheets for long forms, sticky action bars and horizontally scrolling tabs.

---

## Notable implementation details

- **Cascading resets.** Picking a province/city/district/village clears every level below it, so a stale village can never stay attached to a different city.
- **One photo id per slot.** Submission photos are stored per slot (KTP, studio 1…n); replacing a photo replaces its id, so the request always carries exactly `estimated_studio_number + 1` documents as the backend requires.
- **Fee-aware withdrawal.** The check is `amount + adminFee ≤ available balance`; the balance is re-fetched right before the confirmation dialog, and the backend enforces the same rule under a row lock.
- **Inquiry before transfer.** The account-holder name is resolved and shown before the transfer can be confirmed.
- **Timers with cleanup.** The QRIS modal's countdown and status polling stop on paid, expired, close and unmount.

---

## Getting started

### Prerequisites
- Node.js 18+
- A running instance of the backend API

### Install

```bash
npm install
```

### Configure

Create a `.env` file in the project root:

```env
VITE_STUDIO_BAND_BE_BASE_URL="http://localhost:3020/"
```

> The trailing slash matters — endpoint paths are concatenated directly onto this value.

### Run

```bash
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

The dev server is configured with `host: true` and allows `*.ngrok-free.app` / `*.loca.lt` origins, so the app can be tunnelled for testing payment callbacks and email-verification links on a real device.

---

## Project structure

| Path | Contents |
| --- | --- |
| `src/pages/HomePage.vue` | Dashboard: studio grid, search, pagination, submission status, onboarding |
| `src/components/studio/SubmissionFormModal.vue` | The submission form (regions, contact, bank, KTP + one photo per room) |
| `src/pages/StudioNumberFormPage.vue` | Room create/edit: equipment, prices, operating hours, Excel import, photo |
| `src/pages/StudioDetailPage.vue` | Studio detail with the four tabs (`?tab=` keeps the active one) |
| `src/components/studio/SubscriptionModal.vue` | QRIS generation, polling, countdown (duration in days) |
| `src/components/funding/` | Subscription, rent and withdrawal tabs plus transfer and bank-edit modals |

---

## Backend contract

All endpoints are `POST` with a JSON body (file uploads use `multipart/form-data`; the transfer-fee lookup is a `GET`). Responses follow a consistent envelope:

```jsonc
{
  "status": true,
  "message": "success",
  "data": {
    "data":  [ /* rows */ ],
    "page":  1,
    "totalData": 42,   // "total" on the subscription list
    "maxPage": 5
  }
}
```

Timestamps cross the wire as **epoch seconds** and are formatted for display with `toLocaleString('id-ID')`.

Endpoint groups consumed by this app:

- `owner/auth/*` — register, login, verify-email
- `owner/address/*` — province / city / district / village / postal-code pagination
- `owner/file/*` — image upload, Excel upload, template download, studio images
- `owner/studio/*` — submission, list, detail, room list/create/edit/detail, subscription price & QR
- `owner/funding/*` — transaction lists & detail, reconciliation, bank list, bank-account edit, transfer fee, inquiry, transfer, disbursement list
- `user/time/*` — shared date and hour catalogues

---

## Roadmap

- [x] Axios instance + interceptors (headers, 401 handling)
- [x] Route guards
- [x] Shared submission / studio-count state (`useOwnerOverview`)
- [x] Replace `alert()` with toasts
- [x] Split the largest components (submission form, tabs, room form)
- [ ] Internationalisation — UI strings are inlined in Indonesian
- [ ] Component tests for the submission form and the withdrawal flow
