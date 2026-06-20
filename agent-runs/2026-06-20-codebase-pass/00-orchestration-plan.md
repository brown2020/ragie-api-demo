# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/ragie-api-demo
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/ragie-api-demo/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: `npm run lint`, `npm run build` when behavior/runtime/package changes require it, `git diff --check`, targeted source inspection/search, Git remote read, dry-run push, branch sync checks.
- Human-decision blockers: broad product roadmap choices, risky major dependency migrations, external Firebase/Stripe/Ragie production configuration, or security policy changes that alter intended access.
- Resume policy: resume from `run-state.md`, `task-queue.md`, the latest phase report, and Git state. Push any validated local phase commit before new edits.

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint/build/test results are recorded and failures are classified | Baseline is clean or failures are reproducible with ownership |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted check and `npm run lint` pass for each task batch | Confirmed P0/P1/P2 executable tasks are fixed, blocked, or deferred |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Package/deletion proof plus lint/build as needed | Safe cleanup is pushed or deferred with evidence |
| Review | Judge Loop | PASS or bounded follow-up tasks | Review report is pushed and no unowned changes remain |
| Stabilization Loop | Stabilization Loop, Judge Loop, Reflect-or-Kill Loop if needed | Completion criteria pass or exact blocker is recorded | Stabilization report is pushed |
| Integrator | Final Completion Gate | Branch clean, synced, quality gate recorded, final report pushed | Workflow is complete or blocked with next action |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `agent-runs/2026-06-20-codebase-pass/*`, `AGENTS.md`, `SPEC.md` | Startup planning, docs sweep, and resume state |
| T-002 | Baseline report only | Run and classify checks without source edits |
| T-003 | Findings backlog, task queue | Evidence-backed backlog and architecture scorecard |
| T-004+ | Files named by backlog tasks | One small, verifiable task batch at a time |

## Repository Map

- App routes: `src/app/`
- React components: `src/components/`
- Server actions: `src/actions/`
- Firebase setup: `src/firebase/`
- Zustand stores: `src/zustand/`
- Utilities: `src/lib/`
- Firebase rules: `firestore.rules`, `storage.rules`
- Quality scripts: `npm run lint`, `npm run build`

## Startup Notes

- Initial branch was `main`, clean but behind `origin/main`.
- `origin/dev` did not exist. The workflow branch `dev` was created from `origin/main` at `f44fe6f8af4dd0bbbd8d1daa3fb723e384475d1f`, pushed to `origin/dev`, and configured as the upstream.
- Current `dev` matches `origin/dev`.
