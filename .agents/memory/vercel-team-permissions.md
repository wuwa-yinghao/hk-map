---
name: Vercel team permissions
description: Separates Vercel token validity from team membership and project permissions.
---

A Vercel token may authenticate the user successfully while returning 404 for a team project and 403 for project creation when the user is not authorized in the target team.

**Why:** Personal-account authentication and team-level project access are separate permission checks.

**How to apply:** Verify `/v2/user`, then verify the target project and create-project permission. If the project is invisible or creation is forbidden, fix team membership/role or create the project under the personal account; do not keep regenerating tokens without changing scope or membership.