# Chatvioso

**Workspace-based real-time team communication platform** built with Laravel 12 and Next.js—featuring WebSockets, presence, file sharing, reactions, and in-app notifications.

---

## Key features

- **Authentication** — Register, login, token-based API auth (Laravel Sanctum)
- **Workspaces** — Create workspaces, invite members, roles (owner, admin, member), branding (name, logo)
- **Conversations** — Direct messages, group chats, channels
- **Messaging** — Send, edit, delete, reply; emoji reactions; pinned messages; @mentions
- **Realtime** — Live messages, typing indicators, presence, read receipts, unread badges (Laravel Reverb)
- **Files** — Upload attachments in messages; shared files list; authorized download
- **Notifications** — In-app notifications (mentions, invites, etc.); mark read, unread count
- **Search** — Users, conversations, and messages within a workspace
- **Profile & settings** — Profile, avatar, password change, notification preferences
- **Workspace admin** — Settings, logo, member management, leave workspace

---

## Screenshots

Screenshots and presentation assets are planned in [docs/screenshots/](docs/screenshots/). Planned views: login, register, main chat layout, workspace switcher, conversation view, settings, notifications/search.

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | PHP 8.3, Laravel 12, MySQL (or SQLite), Redis (optional), Laravel Sanctum, Laravel Reverb |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| **Realtime** | WebSockets (Laravel Reverb, Pusher protocol) |
| **Storage** | Laravel filesystem (local/public disks for attachments, avatars, logos) |

---

## System overview

```
Client layer
 ├ Web (Next.js)
 └ Future: Flutter desktop/mobile

API layer
 └ Laravel REST API (Sanctum)

Realtime layer
 └ Laravel Reverb (WebSocket)

Data layer
 ├ MySQL / SQLite
 └ Redis (optional; cache/queue)
```

The frontend talks to the backend via REST and WebSocket; the API is designed so other clients (e.g. Flutter) can reuse it.

---

## Setup

### Prerequisites

- PHP 8.3+, Composer
- Node.js 18+, npm
- MySQL (or SQLite for local dev)
- Laravel Reverb for realtime (runs with the API)

### Backend

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `APP_KEY` (e.g. `php artisan key:generate`)
   - Set `APP_URL` and `FRONTEND_URL=http://localhost:3000`
   - Database: `DB_CONNECTION=mysql` and `DB_*`, or keep `DB_CONNECTION=sqlite` for local
   - Realtime: `BROADCAST_CONNECTION=reverb` and set `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`

3. **Sanctum** (if not already published)
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

4. **Migrations**
   ```bash
   php artisan migrate
   ```

5. **Run API**
   ```bash
   php artisan serve
   ```
   Default: `http://localhost:8000`

6. **Run Reverb** (separate terminal, for realtime)
   ```bash
   php artisan reverb:start
   ```
   Uses `REVERB_*` from `.env`. Frontend must use the same host/port/scheme.

7. **Queue worker** (optional; if using queued jobs/broadcasts)
   ```bash
   php artisan queue:work
   ```
   Default `.env` uses `QUEUE_CONNECTION=database`; run migrations before using the queue.

### Frontend

1. **Install dependencies**
   ```bash
   cd frontend && npm install
   ```

2. **Environment**
   - Copy `frontend/.env.local.example` to `frontend/.env.local`
   - Set `NEXT_PUBLIC_API_URL=http://localhost:8000` (match Laravel `APP_URL`)
   - Set Reverb: `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_HOST`, `NEXT_PUBLIC_REVERB_PORT`, `NEXT_PUBLIC_REVERB_SCHEME` to match backend

3. **Run dev server**
   ```bash
   npm run dev
   ```
   App: `http://localhost:3000`

### Testing

- **Backend**
  ```bash
  php artisan test
  # or: composer test
  ```

- **Frontend**
  ```bash
  cd frontend && npm run test:run
  ```

---

## Project structure

- **Backend** — Laravel 12 API in project root: `app/` (Actions, Models, Http, Events), `config/`, `routes/api.php`, migrations, policies.
- **Frontend** — Next.js app in `frontend/`: App Router, `components/`, `hooks/`, `lib/`, `stores/`, `app/` routes.

The project was built in blocks: foundation and auth, messaging core, realtime, product features (files, notifications, search, reactions/pins/mentions, profile, workspace admin), quality and testing, then documentation.

---

## Documentation

- [Features overview](docs/features.md) — What each area of the product does
- [Architecture](docs/architecture.md) — API-first design, realtime, auth, scalability
- [Tech stack & skills](docs/tech-stack.md) — Stack and portfolio-oriented summary
- [Portfolio copy](docs/portfolio-copy.md) — One-line, short, and medium descriptions
- [Screenshots](docs/screenshots/) — Plan and naming for presentation assets

---

## Future improvements

- Threaded replies UI
- Email/push for notifications
- Full-text search (e.g. Meilisearch) at scale
- Optional S3 (or compatible) for file storage in production
- Flutter desktop/mobile clients using the same API and Reverb

---

## Portfolio value

Chatvioso showcases:

- API-first architecture and REST design
- Real-time systems (WebSockets, presence, typing, read state)
- SaaS-style workspace and multi-tenant scoping
- Laravel (auth, policies, events, queues, storage) and Next.js (App Router, TanStack Query, TypeScript)
- End-to-end product: auth, CRUD, realtime, files, notifications, search, profile, admin

Suitable as a portfolio piece for full-stack, Laravel, or frontend roles.
