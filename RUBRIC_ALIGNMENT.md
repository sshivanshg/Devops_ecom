# Project Rubric Alignment Checklist

Evaluation in **2 days**. Use this to align with the rubric and improve your submission.

---

## 1. Regularity – Commit History ✅ / ⚠️

| Rubric | Status | Notes |
|--------|--------|--------|
| Frequent, meaningful commits | ⚠️ | You have 26 commits; many on same days (e.g. 2026-01-27 has ~15). Spread is OK but some messages are vague. |
| No "last-day bulk commit" | ✅ | Work is spread over Jan 27, Jan 28, Feb 9, Feb 23 – not a single dump. |
| Each commit = logical change | ⚠️ | Some messages like "smooth", "lab acti", "Add files via upload", "phase 1/2" are not descriptive. |

**Improving commit history (see below):** Reword vague messages and optionally split any multi-change commits so each commit is one logical change.

---

## 2. GitHub Workflows / CI ⚠️ → Fix below

| Rubric | Status | Notes |
|--------|--------|--------|
| Workflow in `.github/workflows/` | ✅ | `integration.yml`, `deploy-demo.yml` |
| Triggers: push + pull_request | ✅ | integration.yml: push + PR to main |
| Install dependencies | ✅ | client + server `npm i` |
| **Run tests** | ❌ | **Missing in workflow** – add client + server test steps |
| **Run linter** | ❌ | **Missing in workflow** – add client lint (and server when configured) |

**Action:** Add test and lint steps to `.github/workflows/integration.yml`.

---

## 3. Frontend Implementation ✅

| Rubric | Status |
|--------|--------|
| Clean UI (React/HTML/CSS) | ✅ |
| Functional components | ✅ |
| API integration | ✅ |
| UI responsiveness, structure, reusability | ✅ (Tailwind, components) |

---

## 4. Unit Testing ✅ (but not run in CI)

| Rubric | Status | Notes |
|--------|--------|-------|
| Test components/functions | ✅ | Client: Vitest + App.test.jsx; Server: Jest + app.test.js |
| Tools: Jest / Mocha | ✅ | Jest (server), Vitest (client) |

**Action:** Ensure CI runs both test suites.

---

## 5. Integration Testing ⚠️

| Rubric | Status | Notes |
|--------|--------|--------|
| Test interaction between modules (e.g. API+DB, Frontend+Backend) | ⚠️ | Only unit tests present. Consider one integration test (e.g. API route + DB) for extra alignment. |

---

## 6. E2E Testing (Bonus)

| Rubric | Status |
|--------|--------|
| Cypress/Playwright, real user flow | Not implemented (optional bonus) |

---

## 7. PR Checks (Linting) ⚠️ → Fix below

| Rubric | Status | Notes |
|--------|--------|--------|
| PR triggers lint | ❌ | Workflow does not run lint |
| Lint fails on bad code | ❌ | Add lint step to CI |
| ESLint / Prettier | ✅ | Client has ESLint; server has placeholder |

**Action:** Add `npm run lint` (client) to workflow; optionally add server lint later.

---

## 8. Dependabot Configuration ❌ → Fix below

| Rubric | Status | Notes |
|--------|--------|--------|
| dependabot.yml | ❌ | **Missing** |
| Auto-check outdated deps | ❌ | Add `.github/dependabot.yml` |

**Action:** Create `.github/dependabot.yml`.

---

## 9. EC2 + GitHub Integration ✅

| Rubric | Status | Notes |
|--------|--------|--------|
| GitHub Actions → EC2 | ✅ | deploy-demo.yml: SCP + SSH, restart nginx |
| Deploy / run commands | ✅ | Copy demo page, restart nginx |
| Level | **Full** | Automated deployment works |

---

## 10. Idempotent Scripts ✅

| Rubric | Status | Notes |
|--------|--------|--------|
| Scripts safe to run multiple times | ✅ | `ec2-control.sh` only reads state (describe-instances). No `mkdir` without `-p` etc. |

---

## 11. Explanation ✅

| Rubric | Status | Notes |
|--------|--------|--------|
| Architecture | ✅ | README: MongoDB, Cloudinary, API diagram |
| Workflow | ✅ | README: structure, deploy doc in .agents |
| Design decisions | ✅ | Why MongoDB native, why Cloudinary |
| **Challenges** | ⚠️ | Not explicitly called out – add a short "Challenges" subsection in README for full alignment |

---

## Summary: Must-do before evaluation

1. **CI:** Add **run tests** and **run linter** to `.github/workflows/integration.yml`.
2. **Dependabot:** Add `.github/dependabot.yml`.
3. **Commit history:** Reword vague commit messages (and optionally split commits) so history looks regular and meaningful – see next section.
4. **Optional:** Short "Challenges" section in README; one integration test if you have time.

---

## How to improve commit history (for rubric #1)

The rubric wants **frequent, meaningful commits** and **no last-day bulk commit**. Your dates are already spread; the main improvement is **message quality** and, if needed, **splitting** one big commit.

### A. Reword existing commit messages (no date change)

Use interactive rebase to **reword** commits so each message clearly describes one logical change:

```bash
# Reword last 26 commits (adjust number as needed)
git rebase -i HEAD~26
```

In the editor, change `pick` to `reword` (or `r`) for any commit whose message you want to improve. Save and close; Git will open the message for each one. Examples:

| Current | Better |
|--------|--------|
| smooth | chore: update demo page copy |
| lab acti | chore: lab activity – deploy workflow test |
| Add files via upload | feat: add client UI components and assets |
| phase 1 | feat: initial Express server and MongoDB connection |
| phase 2 | feat: add React frontend and product routes |

**Warning:** If you have already pushed to GitHub, rewriting history requires `git push --force`. Only do this on a branch you control (e.g. main if you’re the only one using it). Coordinate with teammates to avoid overwriting their work.

### B. Split a commit that has multiple logical changes (optional)

If one commit contains several unrelated changes:

```bash
git rebase -i HEAD~26
```

Change that commit from `pick` to `edit`. Save. When the rebase stops at that commit:

```bash
git reset HEAD~1
git add -p   # stage changes piece by piece
git commit -m "feat: add X"
git commit -m "fix: Y"
# ... then
git rebase --continue
```

### C. Do not do (academic integrity)

- Do **not** backdate commits to fake “frequent” history.
- Do **not** create empty or fake commits. Only reword/split real work.

---

After making CI + Dependabot + (optional) README changes, commit with a clear message, e.g.:  
`ci: add tests and lint to workflow; add dependabot and rubric alignment`.
