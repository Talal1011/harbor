# Experimental integration candidate — not published

Current candidate: Experimental 0.0.2, internal 0.999.2. The earlier 0.999.1 build below is retained as historical context.

2026-09-07 follow-up: Talal reports playback, subtitle switching/Off while loading, settings and library passed on 0.999.1, and settings/data remained intact after manually returning to 0.9.124. This is manual test evidence, not an automatic recovery test. Candidate 0.999.2 changes recovery discovery/account transport only, with no user-data schema changes. Account requests now use the same native-aware transport as sign-in/token refresh; rejected authentication is denied rather than mislabeled as connectivity failure. The specific original account failure still needs confirmation in the packaged app. Thirty updater/account tests pass. New candidate requires signed artifacts and an Experimental-only release; public beta remains unchanged.

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

## Standalone recovery follow-up (source only)

- Added recovery discovery on updater startup and Experimental checks, independently of account badge verification. Exact installed version must match the current Experimental manifest and its immutable approval; missing/withdrawn/unapproved manifests remain unavailable.
- Existing saved recovery contexts still use their immutable history, so a newer latest pointer does not replace them. A standalone install with no saved context cannot discover an older build after the latest pointer advances; publishing needs a durable per-version discovery index or bundled build identity for that separate case.
- Reject saved contexts belonging to another installed version.
- All 28 updater tests passed; scoped format/lint passed.
- No recovery approval was invented or published. The currently unpublished candidate has no approved target to discover. Manual beta compatibility testing and publisher metadata remain prerequisites for end-to-end recovery testing.
- Previously signed installers are unchanged and do not contain this follow-up. A fresh uniquely versioned build is required before testing the source changes.
- Linux build command was started but stopped after confirming the configuration only overlays bundle settings and would still build Windows on this host. No Linux runtime/toolchain is available; no Linux verification is claimed.
