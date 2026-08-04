---
name: GitHub integration caveat
description: Distinguishes integration status from usable Git push credentials in this workspace.
---

An integration can report `added` while direct Git operations still fail with `UNAUTHENTICATED`; verify the target remote and branch contents before reporting a successful sync.

**Why:** The repository connection was visible as added, but the Git credential path remained unavailable and only a non-default branch could be pushed through the helper.

**How to apply:** Treat the remote's actual branch hashes and a real fetch/push result as authoritative. If credentials remain unavailable, guide the user through GitHub branch operations rather than asking for a raw token.