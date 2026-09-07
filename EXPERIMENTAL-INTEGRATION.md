# Experimental integration candidate — not published

Prepared 2026-09-07 on `experimental/0.0.1`.
Internal app/installer version: `0.999.1` (all eight version files updated).
Base: upstream beta-branch `7098dddf`.

## Included PR heads

- Thunderhawkk: #1359, #1362, #1374, #1385, #1392, #1394.
- O1Abdulrahman: #1376, #1379.
- uddx7: #1396.
- Talal1011: subtitle regression fix #1382.

Each PR is recorded as a local merge, preserving its commit history. No upstream PR was merged or pushed.

## Integration decisions

- Preserve current beta external Continue Watching sources alongside the narrower shared-Stremio gate.
- Preserve current controller settings presentation and file picker; add cursor enable and idle controls.
- Use fullscreen PR's saved maximized/geometry state, retaining beta's fallback window dimensions.
- Retain both content-advisory and keyboard-navigation locale entries and CSS additions.
- Keep #1382's replacement regression coverage rather than restoring obsolete source assertions from other PRs.
- Update stale tests for moved fullscreen settings, renamed manga batch variable, shared-profile gate, and formatting.
- Format/lint files included by the PRs only, not unrelated repository files.

## Validation and remaining gates

- TypeScript passed, including the post-format/versioning rerun.
- Scoped format/lint passed across 136 PR files. Whole-repository format check fails on thousands of existing files; no repository-wide fix applied.
- Windows cargo check passed after setup, with existing unused VapourSynth helper warnings.
- Full combined suite: 1,037 passed, 1 failed (translation coverage), 22 skipped.
- Compared actual missing keys against untouched beta, not only counts: added 27 newly missing keys to the existing English fallback catalog. They are not translations. Remaining Arabic coverage gaps: 216, all also missing on baseline (722). Other inherited language gaps remain outside this integration's scope.
- Linux build command was attempted on Windows and stopped at then-unresolved TypeScript errors. No Linux binary has been built; use a Linux environment for final platform validation.
- No interactive playback, controller, fullscreen, Discord OAuth, manga tracking, or return-to-beta smoke test has been completed here.

## Before signing or publishing

1. Finish final checks and review incremental translation gaps and PR behavior.
2. Set the publisher display identity to Experimental 0.0.1 with a unique build ID; binary identity is already 0.999.1. Never upload it as public beta 0.9.124.
3. Build and sign fresh platform artifacts; do not reuse the published beta's files or signatures.
4. Test 0.9.124 → Experimental → approved 0.9.124 on a disposable profile/install, including settings retention.
5. Test manual subtitle selection 5 → 6 while providers load, manual Off, seeks/cues, and source changes.
6. Test included contributors' affected features before publishing the isolated Experimental feed.

Public beta 0.9.124 remains unchanged.
