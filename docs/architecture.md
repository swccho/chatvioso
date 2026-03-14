# Chatvioso — Architecture overview

This document explains how the system is designed at a high level: API-first approach, backend/frontend separation, realtime, auth, and scalability. It is intended for developers and reviewers who need to understand the project quickly.

---

## API-first approach

The backend is a **REST API** (Laravel) that owns all business logic, persistence, and authorization. The Next.js frontend is one client of that API. The same API and realtime events can serve other clients (e.g. a future Flutter desktop or mobile app) without duplicating logic. All state of truth (users, workspaces, conversations, messages, notifications) lives in the backend; the frontend uses TanStack Query to cache and invalidate API responses.

---

## Backend / frontend separation

- **Backend (Laravel 12):** PHP 8.3, REST endpoints under `/api`, Sanctum token auth, policies for workspace/conversation/message/attachment access, Laravel Reverb for WebSockets, queues and events for broadcasting. Controllers stay thin; complex logic lives in Actions or dedicated classes. Validation uses Form Requests.
- **Frontend (Next.js):** React, TypeScript, App Router, TanStack Query for server state, Zustand only where shared client state is needed (e.g. current workspace/conversation). The frontend does not implement business rules; it calls the API and subscribes to Reverb channels, then updates UI from that data.

There is no shared code between backend and frontend except agreed API shapes and event names. The frontend is configured with `NEXT_PUBLIC_API_URL` and Reverb settings so it can run against a local or remote API.

---

## Realtime architecture

- **Laravel Reverb** runs as a separate process and speaks the Pusher protocol. The frontend uses Laravel Echo with `pusher-js` to connect.
- **Channel model:** Private channel `conversation.{id}` for message and conversation events (only conversation members are authorized). Presence channel `workspace.{id}` for who is in the workspace (for online indicators). Authorization is done in `routes/channels.php`; the frontend sends the Sanctum token to `/broadcasting/auth`.
- **Events:** MessageSent, MessageUpdated, MessageDeleted, ConversationUpdated, and others are broadcast on the appropriate channel. Typing is handled via client events (whisper) on the conversation channel so the backend does not need a typing endpoint. Read state is updated via a mark-read API; unread counts can be invalidated or pushed so the list stays in sync.
- **Flow:** Frontend subscribes when the user has a conversation or workspace selected; on event, it invalidates TanStack Query cache or merges payloads so the UI updates without full page reload.

---

## Queue usage

Laravel’s queue is available (e.g. `QUEUE_CONNECTION=database`). Broadcasting can be configured to use the queue so HTTP responses are fast and events are sent asynchronously. For local development, sync driver is also possible. The setup docs describe running `php artisan queue:work` when using queued jobs or queued broadcasting.

---

## Authentication flow

1. User registers or logs in via API; backend returns a Sanctum token.
2. Frontend stores the token and sends it as `Authorization: Bearer <token>` on every API request.
3. For WebSocket, the frontend calls the backend’s `/broadcasting/auth` with the same token; the backend validates it and allows subscription to authorized channels.
4. There are no session cookies for the SPA; everything is token-based so the same token works for REST and Reverb.

---

## Workspace-based product design

All collaborative data is **scoped by workspace**: conversations belong to a workspace, members belong to workspaces, search is per workspace, and notifications are tied to workspace-related events. A user can be in multiple workspaces and switch between them in the UI. Permissions (owner, admin, member) are per workspace. This gives a natural multi-tenant model: no cross-workspace data leakage, and the API can be extended with more workspace-level features (e.g. billing, audit) later.

---

## Scalability direction

- **Database:** MySQL (or SQLite for dev). Queries use pagination (e.g. cursor for messages) and limits where appropriate. N+1 issues are addressed (e.g. batched unread counts for conversation list).
- **Cache/queue:** Redis can be used for cache and queue drivers to offload the database and speed up broadcasts. Not required for minimal local dev.
- **Realtime:** Reverb can be scaled (e.g. horizontal) with sticky sessions or a driver that supports multiple servers; for a portfolio/MVP, a single Reverb instance is typical.
- **Storage:** Attachments and avatars use the Laravel filesystem (local/public). For production, the same abstraction can point to S3 or compatible storage without changing application logic.

---

## Future Flutter compatibility

The API and event contracts are designed so that a Flutter (or other) client can reuse them: same REST routes, same channel names and event payloads, same auth (Bearer token + broadcast auth). No web-specific assumptions are encoded in the API. Block 6 does not implement Flutter clients; the architecture doc and README note that adding them is a natural next step.
