# Jake Carter — Portfolio

UX/UI, graphic design and marketing portfolio. Static site: hand-written HTML,
CSS and vanilla JavaScript, no build step and no dependencies.

**Live:** https://www.jakescreations.online

## Running it locally

```bash
python3 serve.py
```

Then open http://127.0.0.1:4321

Or just open `index.html` directly. Nothing needs compiling.

## Structure

```
index.html          Homepage
about.html          About
work/*.html         One page per case study
css/site.css        All styling. Design tokens at the top of the file.
js/site.js          Scroll reveals, navigation, image fallbacks
assets/fonts/       Self-hosted Archivo, Geist, Geist Mono
assets/work/        Project imagery
assets/img/         Portrait, social card
assets/files/       Downloadable PDFs
serve.py            Local preview server. Not part of the site.
```

## Design system

The tokens live at the top of `css/site.css`:

| Token | Value | Notes |
|---|---|---|
| `--bg` | `#0f0e0d` | Page background. Dark only, by design. |
| `--accent` | `#e35d33` | The single accent, used page-wide. |
| `--fg` | `#f6f2ed` | Body text |

Type is **Archivo** for display and **Geist** for body, both self-hosted as
variable fonts. Archivo has a width axis, so heading levels differ by width as
well as size, rather than by size alone.

Two conventions worth preserving:

- **Corner radius.** Panels, media and inputs are square. Buttons and pills are
  fully rounded. Do not mix the two.
- **Image sizing.** No image is rendered wider than its source file. The
  `.cs-figure`, `.cs-figure--half` and `.cs-figure--narrow` classes exist to
  keep low-resolution assets from being upscaled.

## Accessibility and performance

- Every text and background pair meets WCAG AA; buttons sit at 5.4:1
- All motion is gated behind `prefers-reduced-motion`
- Scroll effects use IntersectionObserver, never scroll event listeners
- Fonts are self-hosted and preloaded, so there are no third-party requests
