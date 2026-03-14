# Chatvioso — Tech stack and skills

This document summarizes the core technologies and engineering concepts the project demonstrates. It is useful for GitHub, portfolio sites, CVs, and LinkedIn.

---

## Core stack

| Area | Technologies |
|------|--------------|
| Backend | PHP 8.3, Laravel 12 |
| API | REST, Laravel Sanctum (token auth) |
| Database | MySQL (or SQLite for dev) |
| Cache / Queue | Redis (optional), Laravel queues |
| Realtime | Laravel Reverb, WebSockets (Pusher protocol) |
| Frontend | Next.js (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Data (client) | TanStack Query, Zustand (minimal) |
| Storage | Laravel filesystem (local/public disks) |

---

## Backend development

- REST API design and implementation
- API-first architecture
- Laravel Sanctum token-based authentication
- Policy-based authorization (workspace, conversation, message, attachment)
- Form Request validation; thin controllers; logic in Actions
- Event-driven design; Laravel broadcasting and Reverb
- Queues and background job readiness
- Secure file upload and storage (validation, authorized download)
- Pagination (cursor and offset) and query optimization (e.g. batched unread counts)

---

## Frontend development

- Next.js App Router and React Server Components awareness
- React component architecture and composition
- TypeScript for type safety and maintainability
- Tailwind CSS utility-first styling
- shadcn/ui for consistent, accessible components
- TanStack Query for server state, cache, and invalidation
- Zustand for narrow, shared client state (workspace/conversation selection)
- Responsive layout and loading/empty/error states

---

## Realtime systems

- WebSocket-based communication (Laravel Reverb)
- Private and presence channels with authorization
- Real-time message delivery and conversation updates
- Presence (online/offline) and typing indicators
- Read receipts and unread counts
- Client events (whisper) for typing
- Realtime UI sync with cache invalidation and optimistic updates

---

## System architecture

- API-first, client–server separation
- Workspace-based multi-tenant scoping
- Event-driven backend (broadcasting, queues)
- Layered structure (controllers, actions, policies, models)
- Designed for multiple clients (web now; Flutter later) on the same API and realtime layer

---

## Security and validation

- Token-based auth; no session cookies for the SPA
- Role-based access (owner, admin, member) per workspace
- Policy checks on every sensitive endpoint
- Input validation and sanitization; secure file handling
- No cross-workspace or cross-conversation data leakage in search or APIs

---

## Collaboration and product scope

- Direct messages, group conversations, and channels
- Messaging with edit, delete, reply, reactions, pins, mentions
- File attachments and shared-files list
- In-app notifications (mentions, invites, etc.)
- Workspace-scoped search (users, conversations, messages)
- Profile, avatar, password, notification preferences
- Workspace admin: branding, members, roles, leave workspace

This combination shows ability to ship a full-stack, real-time, multi-tenant SaaS-style product with clear structure and production-minded patterns.
