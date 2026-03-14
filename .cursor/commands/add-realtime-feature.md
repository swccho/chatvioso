Implement a realtime feature for Chatvioso using proper backend-driven architecture.

Project context:
- Laravel 12 backend
- Laravel Reverb
- Redis
- Next.js frontend
- API-first architecture
- Realtime must reflect backend truth
- No fake frontend-only realtime logic
- Privacy and conversation authorization must be respected

Your task:
Add the realtime feature: **{feature_name}**

Examples:
- instant message delivery
- typing indicators
- message read receipts
- online/offline presence
- unread count updates
- live conversation list updates

Requirements:
1. Identify backend changes needed.
2. Create or update events for broadcasting.
3. Add listeners/jobs only if needed.
4. Ensure authorization/privacy is respected in broadcast channels.
5. Update frontend subscriptions and handlers.
6. Handle loading/fallback states where needed.
7. Keep optimistic UI safe and rollback-friendly.
8. Ensure backend truth wins over stale client assumptions.
9. Keep implementation scalable and reusable.

Expected output:
- backend event changes
- broadcast/channel updates
- frontend realtime subscription logic
- UI updates reacting to realtime events
- tests or validation where appropriate

At the end, provide:
1. files created/updated
2. event flow summary
3. privacy/authorization considerations
4. possible edge cases
