# HMS-14: Arabic subtitle identity and Live Sync timing

Task: https://harborsystem.online/work?inspect=5bfe04c9-75c0-48c5-87ff-db1e4e05548b

Baseline: Experimental 0.0.3 (`b3ad282200aa8b494a05c8880d058037dabee431`).
This change does not modify a version, release manifest, signing key, or published channel.

## Traced paths and causes

1. Provider search -> `SubResult.lang` -> `addSubtitle` -> prepared local file -> mpv
   `track-list` -> `TrackInfo.lang` -> preferred-language filter -> language group.
   Wyzie assigned `en` to missing language, even when its display field said Arabic.
   The mpv adapter also kept other external metadata but discarded the supplied
   language and title on track refresh. An `en` refresh therefore moved a known
   Arabic download under English, or hid it in an Arabic-only filter.
   Fix: use a known display language as fallback, never invent English, and retain
   external language/title through seed loading and native refreshes.

2. Live Sync aligns an original cue time to the current playback time. One anchor
   gives a constant offset; two anchors previously produced an unbounded linear
   slope. The existing 3-second minimum gap and 5% maximum slope were not used by
   this path. A fixture with anchors (10 -> 12) and (11 -> 14) produced a 123-second
   offset at time 131 instead of the last 3-second alignment.
   Fix: unreliable fits use the latest alignment as a constant offset. Valid
   gradual drift (including common 23.976/25 FPS differences) remains supported.

3. Multi-point/section previews replace the selected track with rewritten cues.
   Cancel restored only the delay, not the original track; Reset could apply a
   new delay over the already rewritten preview. Preview files also reused one
   path, and pending extraction could reopen a cancelled session.
   Fix: restore the original track on Cancel/Reset, preserve preview language,
   give writes unique paths, and invalidate pending extraction/preview/save work.

4. Entering manual Live Sync did not stop automatic analysis/progressive updates.
   Fix: explicitly suspend automatic timing for the current media without
   reverting the current delay. Late automatic results cannot apply; an explicit
   auto-sync run can resume automatic control. New media is not blocked.

These are code-level reproductions of mechanisms consistent with the reports.
The reporters' exact media/provider responses have not been reproduced locally.

## Verification

- Before patch: 5 of 7 new language/drift assertions failed on the 0.0.3 source.
- Before patch: executing the original Live Sync hook in the lifecycle harness
  confirmed Cancel left `preview.srt` selected instead of the original track.
- Added provider-language, native-refresh, bounded-drift, preview Cancel/Reset,
  pending-extraction cancellation, saved-timing and manual-ownership tests.
- Saved-timing test simulates 120 seconds; this is not a two-minute packaged-app test.
- Final subtitle/auto-sync suite: 327 tests, 326 passed, one opt-in native test skipped;
  the native test passed separately with `HARBOR_MPV_TEST_BINARY` configured.
- Existing Windows mpv integration test passes using an isolated process and
  synthetic media: primary/secondary Arabic and English cues, selection and Off.
- Scoped `pnpm run check` and `pnpm run typecheck` pass.
- Frontend production build passes. Existing Vite plugin deprecations,
  mixed static/dynamic import warnings and lottie eval warnings remain untouched.
- `pnpm tauri:build:linux-system` was attempted. On this Windows host it ran the
  frontend build then began Windows compilation; stopped rather than counting it
  as a Linux build. WSL/Linux is not installed. No Linux binary was verified.
- No Rust source changes.

## Packaged-candidate acceptance checklist (pending)

- [ ] Use the same media/provider from each original report and record OS,
      exact build, subtitle ID/language, and reproduction steps without credentials.
- [ ] With Arabic-only preferences, download/switch between Arabic tracks and
      refresh/reopen the menu; confirm they remain present under Arabic.
- [ ] Repeat with English + Arabic, cached tracks, and a missing-language result.
- [ ] Rapidly select Arabic/English/Off while downloads are pending; final choice wins.
- [ ] Align once, Save, play at least two minutes, seek, pause/resume and reopen.
      Confirm the correction is applied once and remains stable.
- [ ] Try two nearby alignments; confirm there is no runaway offset. Also check
      a valid gradual-drift pair and section-only corrections.
- [ ] Cancel and Reset after a rewritten preview; verify original track/timing.
- [ ] Close while loading/saving; no late preview should reopen or replace the choice.
- [ ] Enable background auto-sync, enter manual Live Sync and verify delayed
      automatic work cannot overwrite the manual adjustment.
- [ ] Run the full Linux build and test macOS/Linux playback when available.

Keep HMS-14 open until the original reports pass on a packaged candidate.
