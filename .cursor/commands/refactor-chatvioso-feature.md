Refactor an existing Chatvioso feature to improve code quality, maintainability, and architecture.

Project context:
- Laravel + Next.js monorepo or separated app structure
- Clean architecture rules already defined
- Thin controllers
- Reusable frontend components
- No giant files
- Production-style codebase

Your task:
Refactor the feature/module: **{feature_name}**

Refactor goals:
1. Improve readability.
2. Reduce duplication.
3. Extract reusable parts.
4. Improve naming.
5. Improve file structure if needed.
6. Keep behavior unchanged unless a bug is clearly fixed.
7. Keep API contracts stable unless explicitly required.
8. Improve typing and error handling.
9. Remove dead code and debug leftovers.
10. Make the code easier to test.

Backend refactor rules:
- move business logic out of controllers
- improve validation structure
- improve authorization placement
- extract actions/services where needed

Frontend refactor rules:
- break down large components
- separate fetching from presentation where reasonable
- improve prop typing
- improve state ownership
- remove unnecessary Zustand usage if TanStack Query is more appropriate

At the end, provide:
1. summary of problems found
2. changes made
3. files updated
4. why the new structure is better
5. any follow-up refactor suggestions
