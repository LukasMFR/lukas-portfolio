# Lukas Portfolio

Static bilingual portfolio built with plain HTML, CSS and JavaScript for direct use on GitHub Pages. No build step, no framework.

## Project structure

- `index.html`: single-page structure, SEO tags, no-flash theme bootstrap and font preloads
- `css/style.css`: design system (tokens, light + dark themes), layout, components, responsive rules and motion
- `assets/fonts/`: self-hosted Geist Sans and Geist Mono (`woff2`)
- `js/i18n.en.js`: English content data
- `js/i18n.fr.js`: French content data
- `js/main.js`: rendering, language detection and switch, theme toggle, mobile menu, scroll reveals, magnetic CTA and typewriter
- `assets/images/profile/`: profile photo and Animoji assets
- `assets/images/logos/`: school, company and experience logos
- `assets/images/tech-logos/`: technology and tool logos in `.webp`
- `assets/images/icons/`: interface and social icons in `.webp` (recolored per theme via CSS filters)
- `assets/images/icons-src/`: source SVG files kept for the icon set
- `assets/icons/favicon.svg`: site favicon
- `assets/cv/Lukas_Mauffre_CV.pdf`: linked CV PDF

## Typography

- `Geist` (sans) for UI and headings, `Geist Mono` for labels, metadata and numbers.
- Fonts are self-hosted in `assets/fonts/` and loaded with `@font-face` + `font-display: swap`. The two most used weights are preloaded in `index.html`.

## Theming (light / dark)

- Both themes are fully designed via CSS custom properties (light on `:root`, dark under `[data-theme="dark"]`).
- The initial theme respects the saved preference, then `prefers-color-scheme`. An inline script in `<head>` applies it before paint to avoid a flash.
- A header toggle switches themes manually; the choice is saved in `localStorage`.

## Bilingual behaviour

- English is the default language.
- If the browser language starts with `fr` (and no choice was saved), the site loads in French.
- The manual `EN / FR` switch updates the page instantly without reload.
- The selected language is saved in `localStorage`.

## Accessibility & motion

- Skip link, visible focus rings, semantic landmarks, `aria` states on the menu and language switch.
- Scroll reveals, the typewriter, the marquee and floating accents all collapse under `prefers-reduced-motion: reduce`.

## Local usage

Open `index.html` directly in a browser, or serve the folder (`python3 -m http.server`) and deploy the repository as-is on GitHub Pages.
