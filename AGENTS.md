# AGENTS.md

## Repository purpose

`StarlightDaemon/proxmox-copy-console` contains the Proxmox Copy Console userscript and its project documentation.

## Authoritative project documents

- `proxmox-copy-console.user.js` — current implementation source; version 0.3.0 is the documented baseline.
- `README.md` — user-facing project overview.
- `CHANGELOG.md` — version/baseline record.
- `DECISIONS.md` — durable design decisions.
- `docs/HISTORY.md` — documented project lineage.
- `docs/DESIGN.md` — implementation design represented by the source.
- `docs/TESTING.md` — verification scenarios and evidence boundaries.
- `docs/OPEN-LOOPS.md` — follow-up register, completion criteria, and bounded agent handoff.
- `LICENSE` — licensing terms.

## Mutation discipline

Before changing repository state:

1. Verify the exact repository identity.
2. Verify the exact target branch/ref and current starting commit.
3. Inspect the current repository-native instructions and relevant project documents.
4. Preserve unrelated tracked files unless deletion is explicitly authorized.
5. Match the execution surface to the evidence required by the task.

Treat these as separate authority boundaries unless explicitly granted together:

- implementation/file mutation;
- commit creation;
- remote branch/ref update;
- pull-request creation/review;
- merge;
- tag/release;
- deployment/publication.

A tool's capability does not grant authority. If an API operation necessarily combines actions, authority must cover the combined semantics.

## Baseline protection

Version 0.3.0 is the current documented baseline. Do not silently introduce 0.4.0 experimental behavior into it.

If work targets 0.4.0, identify it explicitly as future/unreleased work and keep current 0.3.0 behavior distinguishable.

## Verification discipline

GitHub-side file/ref evidence is not proof of local execution, runtime correctness, clipboard behavior, or manual Proxmox acceptance. Report those evidence classes separately and do not claim tests were run unless a surface actually ran them.
