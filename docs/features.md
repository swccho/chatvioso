# Chatvioso — Feature overview

This document describes what each area of the product does and how it fits into the product. It reflects the implemented behavior only.

---

## Authentication

**What it does:** Users register with name/email/password and sign in to receive a long-lived API token (Laravel Sanctum). The token is sent with every API request and used for WebSocket auth so the frontend stays authenticated across REST and realtime.

**Why it matters:** All workspace and conversation access is gated by this identity. No session cookies; the SPA uses the token for both API and broadcast auth.

**Flow:** Register or login → token stored (e.g. in memory/localStorage) → token attached to `Authorization: Bearer` and to Echo for `/broadcasting/auth`.

---

## Workspace system

**What it does:** Communication is organized by workspaces. A workspace has a name, optional slug, description, and optional logo. Users belong to workspaces via invitations or creation. Each user has a role per workspace: owner, admin, or member. Owners and admins can manage settings, members, and invitations; members participate in conversations.

**Why it matters:** Workspaces provide multi-tenant scoping. All conversations, search, and notifications are workspace-aware so data and permissions stay isolated.

**Flow:** Create workspace (user becomes owner) → invite by email → accept invitation → switch workspace in UI → list conversations in that workspace.

---

## Conversations

**What it does:** Three types of conversations exist inside a workspace. **Direct messages** are 1:1. **Group conversations** are private groups with named members. **Channels** are workspace-wide (or configured) and joinable. Users see only conversations they are members of. Unread count per conversation is computed from `last_read_at` vs message timestamps.

**Why it matters:** Conversations are the unit of messaging and the scope for messages, files, pins, and reactions. List and detail APIs are scoped by workspace and membership.

**Flow:** Create DM/group/channel from sidebar → open conversation → messages load (cursor-paginated); marking the conversation as read updates unread badges.

---

## Messaging

**What it does:** Users send text messages (and optional attachments) into a conversation. They can edit or delete their own messages, reply to a message (parent reference), add or remove emoji reactions, and pin messages. Message body can include @mentions (e.g. `@123`); mentions are parsed server-side and can trigger notifications. Pinned messages appear in a dedicated list for the conversation.

**Why it matters:** Messaging is the core interaction. Reactions and pins add lightweight collaboration without threads in the first version. Mentions keep relevant users notified.

**Flow:** Type in composer (optional attachments, reply context) → send → message appears (optimistically and via broadcast). Edit/delete/reply/pin/reaction from message actions. Pinned list in the right panel links to the message in context.

---

## Realtime

**What it does:** Laravel Reverb (Pusher-protocol WebSocket server) is used for live updates. Private channel `conversation.{id}` receives message and conversation events so only members get them. Presence channel `workspace.{id}` tracks who is in the workspace (for “online” indicators). Typing is sent as client events (whisper) on the conversation channel. Read state is updated via a mark-read API and reflected in unread counts; optionally an event can notify others.

**Why it matters:** Realtime makes the app feel instant: new messages, typing, presence, and unread updates without polling.

**Flow:** Frontend subscribes to current conversation channel and workspace presence when a workspace is selected. On MessageSent/MessageUpdated/MessageDeleted/ConversationUpdated, the client invalidates or merges cache so the UI updates. Typing and presence update local state for display.

---

## File and media sharing

**What it does:** Users attach files to messages (images, PDFs, documents) when sending. Attachments are stored on the Laravel filesystem (local disk for attachments; public disk for avatars and workspace logos). Only conversation members can upload and download. A “shared files” list per conversation is available via API and shown in the right panel; download goes through an authorized endpoint that checks membership.

**Why it matters:** Files are first-class in conversations and stay scoped to the conversation so access control is simple and consistent.

**Flow:** Select files in composer → send message with attachments → backend stores files, links to message; message payload includes attachment metadata. Download uses `GET .../files/{id}/download` with auth; list uses `GET .../files` for the conversation.

---

## Notifications

**What it does:** In-app notifications are stored per user and triggered by events such as workspace invitations and @mentions. Users get a list (with optional unread filter), unread count, and can mark one or all as read. Notifications carry a type, title, body, and link so the UI can route to the right place.

**Why it matters:** Users stay informed without leaving the app. Notifications are user-scoped and respect visibility (e.g. only mention if the user is in the conversation or workspace).

**Flow:** Event occurs (e.g. mention in message) → notification created for target user(s) → list/count API returns them → user opens panel, marks read; optional realtime push for new notifications.

---

## Search

**What it does:** Within a workspace, users can search by query string. Search can target users (workspace members), conversations (user’s conversations in that workspace), and messages (messages in conversations the user is in). Results are paginated. Only workspace-scoped and membership-respecting data is returned.

**Why it matters:** Search makes it easy to find people, conversations, or past messages without leaking data across workspaces or private conversations.

**Flow:** User enters query in search (e.g. sidebar or search page) → request to `GET .../workspaces/{id}/search?q=...&type=...` → results grouped by type (users, conversations, messages) with links to open the right context.

---

## Profile and settings

**What it does:** The current user can view and update profile (name, email), upload an avatar (stored on public disk), change password (current + new + confirm), and manage notification preferences (e.g. email on mention, in-app on/off). All endpoints are “current user” only; no admin access to other users’ profiles in this scope.

**Why it matters:** Profile and settings give users control over identity and how they are notified, and keep the experience consistent with modern SaaS expectations.

**Flow:** Open profile/settings page → load profile and preferences → submit updates or avatar → API validates and persists; avatar URL returned for display in sidebar and messages.

---

## Workspace admin

**What it does:** Owners and admins can update workspace name, slug, description, and logo. Member management includes listing members, changing roles (admin/member), and removing members. Non-owner members can leave the workspace; the last owner cannot leave (must transfer or delete). Destructive or sensitive actions (e.g. leave) use confirmation in the UI. Policies enforce owner/admin-only actions on the API.

**Why it matters:** Workspace admin keeps the product manageable and safe: clear roles, no accidental data loss, and a single place for branding and membership.

**Flow:** Open workspace settings → edit details or upload logo (owner/admin); open members → change role or remove (owner/admin), or leave (member, with confirm). All actions go through authorized API endpoints.
