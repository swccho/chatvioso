---
name: project-stack
description: Documents the tech stack, architecture, and practices for this fullstack chat SaaS (Laravel 12 API, Next.js frontend, WebSocket realtime). Use when implementing or changing backend APIs, frontend features, realtime behavior, auth, workspace/channel logic, or when the user asks about the project stack or architecture.
---

# Project Stack & Architecture

Reference for this codebase’s technologies and patterns. Prefer these choices when adding or modifying code.

## Backend

- **Runtime**: PHP 8.3, Laravel 12
- **API**: REST, API-first. Design endpoints for consumption by the Next.js app and other clients.
- **Auth**: Laravel Sanctum token authentication.
- **Authorization**: Policy-based; use Laravel policies for resource access.
- **Async**: Event-driven design; Laravel broadcasting, queues, and background jobs where appropriate.
- **Realtime**: WebSocket-based; Laravel broadcasting for live updates.
- **Infrastructure**: Redis for cache and queue driver where it makes sense.
- **Files**: Secure upload handling; validate and constrain file types and size.
- **Requests**: Use Form Requests and validation; keep controllers thin.

## Frontend

- **Framework**: Next.js, React, TypeScript.
- **Styling**: Tailwind CSS (utility-first); shadcn/ui for components.
- **State**: Client state as needed; server state with TanStack Query.
- **Layout**: Responsive; modular component structure.

## Realtime

- WebSocket communication and Laravel broadcasting.
- Real-time event broadcasting, presence (online/offline), typing indicators, read receipts.
- Live conversation updates and UI sync with server events.

## Architecture

- **API-first**: Backend exposes REST API; frontend consumes it.
- **Multi-tenant**: Workspace-based; scope data and permissions by workspace.
- **Events**: Prefer event-driven flows on the backend; use queues for heavy work.
- **Layers**: Clear separation (controllers, services, repositories where used); modular services.

## Collaboration & Messaging

- Direct messages, group conversations, workspace channels.
- Message threading where applicable; file sharing in chat; notifications and search for conversations/messages.

## Performance & Scalability

- Offload work to queues and background jobs.
- Use Redis for caching and queues when beneficial.
- Paginate and limit data; optimize realtime payloads and frontend rendering.

## Security

- Token-based auth (Sanctum); role-based access; workspace membership and permissions.
- Validate and sanitize input; secure file uploads; apply API rate limiting where appropriate.

## Practices

- Clean architecture; modular organization; testable design.
- Env-based configuration; linting and formatting.
- Production-style SaaS patterns (multi-tenant, scaling, security).
