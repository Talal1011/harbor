# Harbor Experimental 0.0.4

An early look at changes being prepared for Harbor’s next beta. This is a development-testing candidate, not a replacement for the regular beta. Back up Harbor before installing.

## What’s in this build

- Installed Experimental changelog in Settings → About and Updates, available offline and after downloading an update.
- Clickable X-Ray results: open an actor’s movies and TV shows inside the player, then use Back/Close to return.
- Full Edge TTS voice discovery for ebooks (#1409).
- Broader TV navigation, settings focus and home search improvements (#1408).
- Updated regression tests and UI fallback coverage (#1407).
- RTL improvements for Big Picture, the poster dock and live TV multiview (#1406).
- Linux MPRIS media controls and metadata (#1372).
- Drag-and-drop list reordering (#1361) and descriptions for custom and featured lists (#1371).
- Retained from 0.0.3: watch-progress season selection (#1401), encrypted HLS playback changes (#1400), and ElegantFin sidebar/back alignment (#1399), alongside the earlier experimental integrations.
- Arabic/English subtitle identity and Live Try timing fixes from `harbor-subtitle-language-live-try`.
- Latest upstream beta through `3ad86931`: Discord account sign-in/linking/recovery was removed upstream. Discord Rich Presence is separate and remains available.

## What to test

Record your operating system, installed version and result for each applicable check. A passing automated test does not replace these checks on the packaged app.

- **Installed changelog:** In Settings → About or Updates, choose “View experimental changelog”. Check headings, lists and scrolling. Close with Escape/Back and verify focus returns. Restart Harbor and repeat offline, signed out, and with no new update available. The displayed notes must still identify Experimental 0.0.4, not another feed version. Check notes also remain in an update card after downloading.
- **X-Ray actor results:** Enable X-Ray, play a title and select a recognized actor. Confirm the actor identity, Movies and Shows sections; open a title, go Back, then Close. Repeat from the compact rail, In scene and Cast tabs. Use mouse, keyboard Enter/Space and controller activation. Focus alone must not open a result, and navigation must not seek, pause or replace playback. Check missing photos, unavailable TMDB/network, and switching titles. Actual recognition and playback still require packaged-platform smoke tests.

1. **Install and retain data:** Back up settings, library and watch progress. Install the candidate, restart, and confirm your existing data remains. Test Return to beta only against a publisher-approved target; record the exact versions and whether settings survived.
2. **Subtitles:** With Arabic preferred, add Arabic and English results. Select Arabic, switch to English and back, then reopen the menu. Confirm labels, grouping and displayed text agree. Select Off while results load and confirm subtitles stay off. In Live Try, adjust timing, seek, pause/resume and wait several minutes; confirm the manual offset does not reset or drift. Repeat after changing the video source.
3. **TV navigation and RTL:** Use a keyboard or controller to visit all settings categories and home search. Focus an input without activating it, then activate and edit it. Close overlays and check focus returns. In Arabic/RTL, check Big Picture, poster dock and multiview navigation in both directions. Repeat in English.
4. **Ebook voices:** Open an ebook, load the voice list, choose voices in two languages and play a passage. Reopen the reader and confirm voice selection still works. Check the error state with the network unavailable.
5. **Lists:** Create a disposable list with several items and a description. Reorder items, reopen it, and confirm order and description persist. Edit the description and inspect the profile/shared-list view. Check empty descriptions and long descriptions. Confirm ordinary item selection still works after dragging.
6. **Linux media controls:** During playback, use desktop media controls for play/pause, seek and volume. Verify title, artwork and position update. Switch episodes, stop playback, then reopen Harbor; old metadata should not remain. Test with no session bus available if your setup supports it.
7. **Playback regression:** Play a known encrypted HLS stream long enough to cross multiple segments. Check seeking and pause/resume. On Windows, change audio output and test sleep/wake audio recovery. Check fullscreen entry/exit and saved window bounds.
8. **Retained features:** Confirm season selection follows watched progress without skipping an unwatched finale. In ElegantFin, collapse/expand the sidebar and use Back. Test desktop notification delivery with an opted-in rule, manga progress sync and controller cursor settings if you use them.

## Report an issue

Submit it through [Harbor System](https://harborsystem.online). Include Experimental 0.0.4, your OS, the affected feature, steps to reproduce, expected result and actual result. Remove passwords, tokens, IPTV credentials and private URLs from logs or screenshots before sharing.

Thank you for testing and for your continued support. Credits for the requested PRs: kalashnikxvxiii, O1Abdulrahman, anmol210202, pengunnn and OwaisByte, with the earlier experimental contributors retained in Git history.

## Preparation record

- Candidate branch: `experimental/0.0.4`; internal updater version: `0.999.4`.
- All ten requested PR heads are included; #1399, #1400 and #1401 were already present.
- Subtitle fixes include `45e4a99d` and QA record `bd1b0a8e`.
- Pre-publication UI follow-up: TypeScript passed. Automated suite: 1,132 passed, 22 skipped, no failures (including eight new changelog/X-Ray regression tests).
- Scoped format/lint passed. The list-description fallback is English until translated; it is not a claim of full translated coverage.
- Native packages, updater signatures and platform smoke tests remain separate release gates. No publication or recovery approval is implied by this document.
- The unconfirmed playback-speed work in the main checkout is not included in this candidate.

The older `bd90f2c1` installers and CI run `34367568625` do not contain these two UI additions. Rebuild and re-sign from this follow-up before uploading, with a new immutable build ID. No beta, stable or legacy feed change is part of this work.

For future experimental releases, add the installed internal-version entry in `src/lib/updater/experimental-notes.ts` together with the version bump. Its exact-version lookup deliberately does not substitute the current feed’s notes for the installed build.
