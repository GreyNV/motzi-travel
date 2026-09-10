# Phase two: silent video previews and VEED embeds

Status: planned, not implemented in the phase-one main push. Requested 2026-09-11. Keep the tested native MP4 players for the owner's production comparison first.

## Requested experience

- Each visible room video autoplays silently, looping the first three seconds (0–3 seconds).
- Clicking/tapping the preview, or activating its keyboard-accessible play button, ends preview looping, enables sound, reveals full controls, and continues the full video from the current position without restarting.
- Only one full video plays with audio at a time. Pause other full players when another is activated.
- Pause previews offscreen and when the browser tab is hidden. Do not interrupt a user-selected full video merely because a preview timer fires.
- Provide a pause-preview control. Respect reduced-motion preferences and autoplay rejection with a still poster and explicit play button. Never depend on audible autoplay before a user gesture.

## Investigation — 2026-09-11

VEED supports website embedding. Its official help page says generated embed code is available on Pro or higher, not the Free plan, and explains the browser restriction on autoplay with sound:
https://support.veed.io/en/articles/11029688-how-to-share-your-videos

The prior implementation constructed `/embed/<id>` URLs from share links. A direct GET of the existing city-view URL returned HTTP 200 **and `X-Frame-Options: SAMEORIGIN`** on 2026-09-11:
https://www.veed.io/embed/e245af0d-4def-45d6-9d59-bbefd0d69602

That response is evidence that this particular endpoint can reject cross-origin embedding even though VEED offers embedding generally. An HTTP 200 alone does not establish iframe compatibility. Do not assume the old failure was only a local sandbox issue. Obtain the actual generated embed code from the video owner's VEED Share/Embed interface and compare its URL and account/video access settings. No account subscription or video-sharing setting has been changed during this investigation.

The reviewed VEED help page does not document a player SDK or parameters for seeking, a three-second segment loop, playback-time events, or programmatic unmute. Those capabilities remain unverified. Do not copy Vimeo/YouTube parameters onto VEED URLs and assume support. The outer page cannot directly manipulate a cross-origin iframe's video element; it needs an officially supported player API/message protocol.

## Implementation sequence

1. Obtain official generated VEED embeds for the six current videos and confirm the owner's plan supports embedding. Test one embed on the actual Vercel preview and production origins; inspect response headers and browser console. Then test the remaining five.
2. Verify supported mute, autoplay, time-update, seek, play/pause, and volume methods with VEED's documentation or support. Test whether a click can switch from the short preview into uninterrupted full playback with sound. No security-header stripping or cross-origin restrictions bypass.
3. If these capabilities work, implement a VEED adapter with `preview`, `full`, `paused`, and `error` states. Restrict any supported postMessage integration to the documented origin and exact iframe window. Rewind to zero at three seconds only in preview state. On activation, cancel preview-loop logic before unmuting/playing.
4. If VEED cannot offer the required control, retain the provided MP4s in native HTML video elements. This can deliver the exact requested behavior using currentTime, muted, play/pause, and playback events. Explain the finding before choosing a different hosting provider. A native preview that swaps to an iframe is a secondary option only if interruption/restart is acceptable; it does not meet the seamless-continuation requirement by default.
5. For native playback, keep the same media element/source through the click transition. Use video-frame callbacks where available (with a timeupdate fallback) for the three-second boundary. Use an IntersectionObserver for preview visibility. Do not set native `loop` on the full-length file: that loops the entire video, not a three-second segment.
6. Use room-specific poster frames. Confirm the provided files contain audio tracks; files with no audio cannot produce sound on activation. Keep a direct walkthrough link for player/network failures.

## Acceptance checks before rollout

- All six previews load without iframe refusal on both Vercel preview and production.
- Each stays muted and repeats approximately 0–3 seconds for at least three cycles; never plays the full recording before activation.
- Click, tap, Enter, and Space activate sound and continue past three seconds from the current position, with no preview timer seeking backward afterward.
- Seeking, pause/resume, volume, fullscreen, and replay remain usable. At most one video has active audio.
- Offscreen previews and hidden tabs stop consuming playback resources. Reduced-motion and rejected autoplay provide a usable manual fallback.
- Verify desktop Chrome/Firefox/Safari, iOS Safari, Android Chrome, narrow screens, and a slow connection. Check download size and avoid fetching all six full videos just to show previews.
- SOLD OUT overlays remain visible without blocking video controls or the click target.
- Compare the same version and settings in preview and production, including hero, food image, dates, prices, admin saves, and inquiry outcomes.

## Production handoff for phase one

The owner will set ADMIN_PASSWORD in Vercel and review production. It must be at least 16 characters. Admin saving and inquiry storage also require GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY, plus Settings and Inquiries tabs; see deploy/README.md. Apply variables to Production and redeploy for changes to take effect. No credentials belong in this document or Git.

Source references:
- VEED sharing/embedding: https://support.veed.io/en/articles/11029688-how-to-share-your-videos
- Native video controls and autoplay: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
