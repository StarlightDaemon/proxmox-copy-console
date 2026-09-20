# AGENTS.md

## Repository purpose

`StarlightDaemon/proxmox-copy-console` contains the Proxmox Copy Console userscript and its project documentation.

## Authoritative project documents

- `proxmox-copy-console.user.js` — stable 0.4.1 on main, preserving the live-tested 0.4.1-dev.1 runtime after maintainer-approved promotion. Preserve the evidence limits in Testing.
- `README.md` — user-facing project overview.
- `CHANGELOG.md` — version/baseline record.
- `DECISIONS.md` — durable design decisions.
- `docs/README.md` — current documentation index.
- `docs/historicals/` — preserved project lineage, earlier designs, reviews, research, and test records; status statements are historical.
- `docs/DESIGN.md` — implementation design represented by the source.
- `docs/TESTING.md` — current compatibility, verification scenarios, troubleshooting, and evidence boundaries.
- `docs/OPEN-LOOPS.md` — current follow-up register and completion criteria; completed handoffs are archived.
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
