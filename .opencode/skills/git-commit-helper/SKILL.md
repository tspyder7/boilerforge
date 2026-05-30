---
name: git-commit-helper
description:
    Generate conventional commit messages automatically. Use when user runs git commit, stages
    changes, or asks for commit message help. Analyzes git diff to create clear, descriptive
    conventional commit messages. Triggers on git commit, staged changes, commit message requests.
compatibility: opencode
metadata:
    audience: developers
    workflow: git
---

## What I do

- Analyze staged changes to understand what was modified
- Generate a conventional commit message based on the diff
- **ALWAYS present the message and wait for explicit user approval**
- **NEVER execute `git commit` without `yes` / `y` confirmation**
- **NEVER SKIP** any **HUSKY** commit message hooks
- Allow the user to edit or regenerate the message before committing

---

## ⚠️ Mandatory Confirmation Gate
**This is the single MOST IMPORTANT RULE in this skill. I MUST NOT run `git commit` without explicit user confirmation.**

After generating a commit message, I MUST output the confirmation prompt below and then **STOP**.
I do not proceed, I do not guess intent, I do not auto-commit.
Execution only resumes when the user replies with `yes`, `edit`, or `no`.

```
─────────────────────────────────────────
  Proposed commit message:

  <type>(scope): subject line

  Optional body lines

  Optional footer
─────────────────────────────────────────
  Commit with this message? [yes / edit / no]
```

### Response handling

| User reply | Action |
|---|---|
| `yes` / `y` / `Y` | Run `git commit -m "..."` exactly as shown |
| `edit` / `e` | Print the message in an editable block, ask user to paste back the revised version, then show the gate again |
| `no` / `n` / `N` | Discard and regenerate a new suggestion, then show the gate again |
| Anything else | Treat as `no` — ask for clarification, do not commit |

---

## Analysis Process

### Step 1 — Inspect staged changes
```bash
git diff --staged --name-only   # list changed files
git diff --staged               # full diff for content analysis
```

### Step 2 — Categorize changes

| Observation | Likely type |
|---|---|
| New feature files | `feat` |
| Bug fix in existing file | `fix` |
| Urgent production patch | `hotfix` |
| Restructured code, no behavior change | `refactor` |
| Test files only | `test` |
| Docs / README | `docs` |
| CI, tooling, deps | `chore` |
| Breaking change | add `!` after type, add `BREAKING CHANGE:` footer |

### Step 3 — Compose the message

**Subject line** (required)
- Max 72 characters
- Imperative mood: "add" not "added"
- No period at end
- Lowercase after the type prefix
- Format: `type(scope): subject`

**Body** (optional, include when the *why* needs explanation)
- Blank line after subject
- Wrap at 72 chars
- Bullet points for multiple distinct changes
- Explain *what* and *why*, not *how*

**Footer** (optional)
- `BREAKING CHANGE: <description>`
- `Closes #123`, `Fixes #456`

---

## Conventional Commit Types

| Type | Use case |
|---|---|
| `feat` | New features or capabilities |
| `fix` | Bug fixes |
| `hotfix` | Urgent production fixes |
| `refactor` | Code restructuring, no behavior change |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `docs` | Documentation updates |
| `style` | Formatting, linting (no logic change) |
| `chore` | CI/CD, dependencies, tooling |

### Follow Conventional Commits:

Format: <type>(<scope>): <subject>
Types: feat, fix, docs, style, refactor, perf, test, chore.
Example: feat(db): implement schema initialization and seed data scripts

---

## Examples

### Feature addition
```
─────────────────────────────────────────
  Proposed commit message:

  feat(auth): add JWT-based authentication

  - Implement login/logout flow
  - Add token management service
  - Guard protected routes with auth middleware

  Closes #42
─────────────────────────────────────────
  Commit with this message? [yes / edit / no]
```

### Bug fix
```
─────────────────────────────────────────
  Proposed commit message:

  fix(UserList): resolve memory leak on unmount

  Subscription in useEffect was never cleaned up,
  causing leak when component unmounts.

  Closes #156
─────────────────────────────────────────
  Commit with this message? [yes / edit / no]
```

### Breaking change
```
─────────────────────────────────────────
  Proposed commit message:

  feat(api)!: update user response format

  Response now returns { data, metadata } instead of
  a direct array to support pagination and filtering.

  BREAKING CHANGE: clients must update to new shape
─────────────────────────────────────────
  Commit with this message? [yes / edit / no]
```

### Edit flow
```
User: edit

  Here is the message — paste it back with your changes:

  feat(auth): add JWT-based authentication

  - Implement login/logout flow
  - Add token management service
  - Guard protected routes with auth middleware

  Closes #42

[user pastes revised version]

─────────────────────────────────────────
  Proposed commit message:

  feat(auth): add OAuth2 and JWT authentication
  ...
─────────────────────────────────────────
  Commit with this message? [yes / edit / no]
```

---

## Tips for Good Messages

1. **Be specific** — "fix login redirect loop" not "fix bug"
2. **Imperative mood** — "add" not "added" / "adds"
3. **Reference issues** — always include issue numbers when available
4. **Flag breaking changes** — use `!` in subject and `BREAKING CHANGE:` in footer
5. **Body = why, not how** — the diff already shows how
