# AGENTS.md

## Repository purpose

`StarlightDaemon/proxmox-copy-console` contains the Proxmox Copy Console userscript and its project documentation.

## Authoritative project documents

- `proxmox-copy-console.user.js` — current implementation source; version 0.4.0 is promoted from the live-tested 0.4.0-dev.2 runtime.
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

Version 0.3.0 remains the historical baseline at commit `27a83d2ac836ef35c2f7e6644b6e448355631be0`. Do not rewrite its documented behavior or evidence.

Version 0.4.0 promotes the unchanged 0.4.0-dev.2 runtime following the maintainer's live workflow acceptance. Preserve the scope and limitations of that evidence in `docs/TESTING.md`; do not imply that the full compatibility matrix has passed. Identify future experimental behavior as unreleased work.

## Verification discipline

GitHub-side file/ref evidence is not proof of local execution, runtime correctness, clipboard behavior, or manual Proxmox acceptance. Report those evidence classes separately and do not claim tests were run unless a surface actually ran them.
