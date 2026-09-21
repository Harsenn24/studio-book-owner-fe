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
├── api/                  # Endpoint wrappers grouped by backend domain
│   ├── studio.js         #   studios, rooms, subscriptions
│   └── funding.js        #   transactions, reconciliation, disbursement, banks
├── services/axios/       # Cross-cutting request helpers
│   └── ip-adress.services.js
├── components/
│   ├── <Page>/           # One folder per screen
│   └── StudioDetailPage/
│       └── Tab/          # Tab bodies + their modals, isolated per concern
├── router/index.js
├── main.js
└── style.css
```

**API layer.** Every backend call lives in `src/api/`, never inline in a component. Each wrapper attaches the same four headers that the backend requires on authenticated routes:

| Header | Value |
| --- | --- |
| `authorization` | `Bearer <token>` from `localStorage` |
| `x-device-id` | Per-device UUID minted at login |
| `x-ip-address` | Resolved once via ipify |
| `x-request-id` | Fresh UUID v4 per request, for server-side tracing |

**Tabs as components.** `StudioDetailPage` owns only the tab state and the shared studio fetch; each tab (`ProfilPage`, `SubscriptionTransactionPage`, `UserRentTransactionPage`, `WithdrawalTransactionPage`) fetches and paginates its own data and is mounted only when active — so switching tabs never carries stale state or dangling requests from the previous one.

**Filter → fetch loop.** The transaction tables share one pattern: a reactive `filters` object under a `deep` watcher that resets to page 1 and refetches, plus a separate `page` watcher. Date inputs are converted to epoch seconds with end-of-day normalisation (`23:59:59.999`) so an end-date filter is inclusive, and optional filters are only added to the payload when non-empty rather than sent as empty strings.

---

## Notable implementation details

A few things that were more interesting than they look:

- **Cascading resets.** Each address selector clears every dependent field *and* its loaded option list before triggering the next fetch. Without this, changing a province after filling the form would leave a stale village ID attached to a different city.
- **Dual timers with disciplined cleanup.** The QRIS modal is the only place in the app running background work. Every `setInterval` handle is nulled after `clearInterval`, and cleanup is wired to four separate exits (paid, expired, closed, unmounted).
- **Fee-aware balance validation.** The withdrawal check is `amount + adminFee ≤ pendingRecon`, not `amount ≤ balance` — the fee is fetched separately and folded into a `computed`, so the owner is never allowed to request an amount that would fail at the bank.
- **Inquiry before transfer.** Resolving the account-holder name and showing it for confirmation is a deliberate extra round-trip; it is the standard safeguard against typo'd account numbers in Indonesian interbank transfers.
- **One component, two modes.** `CreateStudioDetailPage` detects edit mode from route params alone, then conditionally fans out its `onMounted` fetches with `Promise.all` — five parallel calls in edit mode, four in create mode.
- **Concurrent bootstrapping.** Every page that needs multiple independent resources fires them with `Promise.all` behind a single loading spinner, with `isLoading` cleared in `finally` so a failed call can't leave the app stuck on a spinner.

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
| `src/api/studio.js` | Studio list, submission check, room CRUD, subscription price / QR / status |
| `src/api/funding.js` | Subscription & rental transaction lists, transaction detail, reconciliation, bank list, bank edit, transfer fee, inquiry, transfer, disbursement list |
| `src/components/ModalAddStudioPage/` | The full business-submission form |
| `src/components/CreateStudioDetailPage/` | Room create/edit, equipment, pricing, operating hours, Excel import |
| `src/components/PaymentSubscribeModal/` | QRIS generation, polling, countdown |
| `src/components/StudioDetailPage/Tab/` | The four detail tabs plus the transfer and bank-edit modals |

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
    "total": 42
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

Honest notes on what this codebase would need before production:

- **Axios instance + interceptors.** Auth headers are currently assembled per function and read from `localStorage` at module load, which means a token refresh requires a page reload. A shared instance with request/response interceptors would remove the duplication and enable automatic 401 handling.
- **Route guards.** Authentication is enforced by the backend; the router does not yet block unauthenticated navigation.
- **Centralised state.** Some data (studio list, submission status) is fetched independently by more than one component. Pinia would deduplicate these.
- **Replace `alert()`** with the toast pattern already used elsewhere in the UI.
- **Extract `<script setup>` blocks** from the largest components, following the split already prototyped in `LoginPage.script.js`.
- **Internationalisation** — UI strings are currently inlined in Indonesian.
- **Automated tests** — no test harness is wired up yet.
