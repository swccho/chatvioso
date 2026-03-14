Create a complete Laravel API module for Chatvioso.

Project context:
- Laravel 12
- PHP 8.3
- API-first architecture
- Sanctum auth
- MySQL
- Redis
- Reverb for realtime
- Clean architecture
- Thin controllers
- Validation through Form Requests
- Authorization through Policies
- Use API Resources when appropriate

Your task:
Create a full backend module for: **{module_name}**

Requirements:
1. Create all necessary backend files for this module.
2. Follow clean Laravel structure.
3. Keep controllers thin.
4. Extract business logic into Actions or Services if needed.
5. Use Form Request validation.
6. Add Policy authorization where needed.
7. Add API Resource classes for responses where needed.
8. Add routes in the correct API route file.
9. Add model relationships if needed.
10. Add migrations if new tables are required.
11. Add events/jobs/listeners only if this module needs them.
12. Add feature tests for core API flows.

Expected output:
- migration files
- model
- controller
- form requests
- policy
- action/service classes
- api resource
- routes
- tests

Implementation rules:
- no giant controllers
- no duplicated logic
- no hardcoded values
- clear naming only
- production-style code only

At the end, provide:
1. file list created/updated
2. short explanation of architecture decisions
3. any follow-up tasks if needed
