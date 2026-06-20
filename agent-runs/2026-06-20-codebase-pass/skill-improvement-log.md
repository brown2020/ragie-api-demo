# Skill Improvement Log

| ID | Trigger | What Happened | Skill Root Cause | Proposed Change | Classification | Status |
| --- | --- | --- | --- | --- | --- | --- |
| SI-001 | Missing default workflow branch | The repo had `main` and `origin/main`, but no local or remote `dev`. The run created `dev` from the fetched remote default and pushed it before phase work. | `$sb-cbi` requires `dev`/`origin/dev` but does not explicitly define the safe bootstrap path when the target repo has no `dev` branch. | Add a startup rule: if the target branch is absent, the tree is clean, remote read works, and the user invoked the default workflow, create the target branch from the fetched remote default, dry-run push, push with upstream, then continue; otherwise stop with exact blocker. | Propose | Recorded for future workflow maintenance; no source skill edit applied during this target repo pass. |

## Applied Updates

- None.

## Source Sync

- Source repo: brown2020/sb-codex-skills
- Commit: None.
- Push status: Not needed.
- Install refresh: Not needed.

## Proposed Future Updates

- Consider adding explicit absent-target-branch bootstrap guidance to the `$sb-cbi` startup gates.
