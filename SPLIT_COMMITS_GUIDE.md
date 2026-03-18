# How to Split and Clean Up Commit History

Use this to turn one big or messy commit into several smaller, logical commits. No date changes—just reorganizing real work.

---

## 1. Split one commit into multiple commits

Use this when a single commit has several unrelated changes (e.g. "Add files via upload" or "phase 1").

### Step 1: Start interactive rebase

Pick the commit **above** the one you want to split (its parent). To split the **oldest** commit (`223f96d first commit`), you need to rebase from the root:

```bash
cd /Users/shivanshgupta/Documents/Devops_Ecom
git rebase -i --root
```

To split a commit in the **middle** of history (e.g. `aedcb00 Add files via upload`), use its parent:

```bash
# List commits to find the parent hash of the commit to split
git log --oneline

# Rebase onto the parent (replace PARENT_HASH with the commit before the one you split)
git rebase -i PARENT_HASH
```

Example: to split `aedcb00 Add files via upload`, its parent is `fb9576d`. So:

```bash
git rebase -i fb9576d
```

### Step 2: Mark the commit to split as "edit"

In the editor that opens you’ll see something like:

```
pick aedcb00 Add files via upload
```

Change `pick` to `edit` (or `e`):

```
edit aedcb00 Add files via upload
```

Save and close the editor.

### Step 3: Undo the commit but keep the changes

When rebase stops at that commit:

```bash
git reset HEAD~1
```

All changes from that commit are now in your working tree (staged + unstaged). The commit is gone.

### Step 4: Create new commits in logical chunks

Stage and commit in small, logical steps.

**Option A – by directory:**

```bash
git add server/
git commit -m "feat: add Express server and API routes"

git add client/src/components/
git commit -m "feat: add React UI components"

git add client/src/pages/
git commit -m "feat: add page components and routing"
```

**Option B – by file (interactive staging):**

```bash
git add -p
# For each chunk: y = stage, n = skip, s = split hunk, q = quit when done
# After staging one logical set of changes:
git commit -m "feat: add X"

# Repeat git add -p and git commit until everything is committed
```

**Option C – by file list:**

```bash
git add path/to/file1 path/to/file2
git commit -m "feat: add Y"
```

Repeat until every change is committed.

### Step 5: Continue the rebase

```bash
git rebase --continue
```

If the editor opens for a merge/rebase message, save and close. Repeat until rebase finishes.

### Step 6: If you already pushed this branch

History was rewritten, so you need a force push:

```bash
git push --force-with-lease
```

Only do this on a branch you own (e.g. your main or feature branch). Don’t force-push on shared branches without agreement.

---

## 2. Only reword commit messages (no split)

Use this to fix vague messages like "smooth", "lab acti", "phase 1" without splitting.

```bash
git rebase -i --root
```

Change `pick` to `reword` (or `r`) for each commit you want to rename:

```
reword 06baf6b smooth
reword 38ebbc0 Fix permissions and update target path to nginx root
pick 572dc0b Testing real-time deployment from lab branch
reword 9e73cd8 lab acti
...
```

Save and close. Git will open the editor for each reworded commit so you can change the message.

**Example better messages:**

| Current message           | Suggested message |
|---------------------------|-------------------|
| smooth                    | chore: update demo page copy |
| lab acti                  | chore: lab – test deploy workflow |
| Add files via upload       | feat: add client and server baseline |
| phase 1                   | feat: initial Express server and MongoDB |
| phase 2                   | feat: add React frontend and product routes |
| first commit              | chore: initial project setup |

---

## 3. Split and reword in one rebase

You can combine both:

1. Use `git rebase -i --root` (or `git rebase -i PARENT_HASH`).
2. Use `edit` for commits you want to **split**.
3. Use `reword` for commits where you only want to **change the message**.
4. When it stops on an `edit` commit, do the `git reset HEAD~1` and multiple `git add` + `git commit` steps, then `git rebase --continue`.

---

## 4. Quick reference

| Goal                    | Command / step |
|-------------------------|----------------|
| Split one commit        | `git rebase -i PARENT` → `edit` that commit → `git reset HEAD~1` → multiple `git add` + `git commit` → `git rebase --continue` |
| Reword messages only    | `git rebase -i --root` → change `pick` to `reword` for chosen commits |
| After rewriting history | `git push --force-with-lease` (only on your own branch) |
| Abort rebase            | `git rebase --abort` |

---

## 5. Good commit message style

- **feat:** new feature  
- **fix:** bug fix  
- **docs:** docs only  
- **chore:** tooling, config, no app logic  
- **ci:** CI/workflow changes  

One line summary, optional body. Example: `feat: add product grid and filters`.
