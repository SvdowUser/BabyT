# BabyT web structure

- `/` — gaming-focused project home
- `/game.html` — Brainrot Battles alpha and development
- `/world.html` — BabyT character/world archive
- `/merch.html` — plush and future merch
- `/token.html` — official token verification

The homepage uses a silent 9.2-second cinematic loop, with a smaller file on screens up to 680px wide. `hero-media.js` pauses it when the hero leaves view, the tab is hidden, or the trailer dialog opens. Reduced-motion and data-saving preferences initially show the poster instead; the visitor can explicitly start playback.

- `assets/media/brainrot-hero-loop.mp4` — 1280×720 background, no audio track
- `assets/media/brainrot-hero-loop-mobile.mp4` — 768×432 background, no audio track
- `assets/media/brainrot-hero-poster.jpg` — still-image fallback
- `assets/media/brainrot-cinematic-trailer.mp4` — complete 1080p trailer with audio, loaded only after Watch Trailer is clicked
- `assets/media/brainrot-trailer-poster.jpg` — trailer preview

The native trailer dialog supports keyboard dismissal and player controls. Closing it stops trailer audio and resumes the background unless the visitor paused it. Playback and layout are handled by `hero-media.js` and `hero-media.css`; all media URLs are relative so GitHub Pages project paths work.
