# Lukas Mauffré — Portfolio

Bilingual single-page portfolio for a cybersecurity, systems and infrastructure profile. Built from scratch with plain HTML, CSS and JavaScript so it can be served directly from GitHub Pages with no build step.

## Project structure

- `index.html`: page shell, SEO/social meta, theme pre-paint script, ambient background and grain layers
- `css/style.css`: design system (tokens, dual theme, layout, components, motion, responsive rules)
- `js/i18n.en.js` / `js/i18n.fr.js`: English and French content data
- `js/main.js`: rendering engine, language switch, theme toggle, scroll reveals, navigation and typewriter
- `assets/fonts/`: self-hosted woff2 (Space Grotesk, Geist, JetBrains Mono)
- `assets/images/profile/`: portrait and Animoji assets
- `assets/images/logos/`: school and company logos
- `assets/images/tech-logos/`: technology marks shown on skill and project chips
- `assets/images/icons/`: interface and social icons
- `assets/icons/favicon.svg`: site favicon
- `assets/cv/Lukas_Mauffre_CV.pdf`: linked CV

## Design system

- Typography: Space Grotesk (display), Geist (body), JetBrains Mono (technical labels), self-hosted with `font-display: swap`
- A single deep-teal accent across light and dark, cool-slate neutrals, tinted shadows
- Pill interactive elements, soft-cornered containers, hairline borders, ambient grid and grain texture
- Motion: scroll-reveal stagger, button and card micro-interactions, a single tool marquee, all gated by `prefers-reduced-motion`

## Bilingual behaviour

- English is the default. A browser language starting with `fr` selects French on first visit.
- The `EN / FR` switch updates the page instantly without reload and is saved in `localStorage`.

## Theme behaviour

- Three modes: follow system, light, dark, chosen from the segmented control in the header (desktop) or menu (mobile).
- The default follows `prefers-color-scheme`; an explicit choice is saved in `localStorage` and applied before first paint to avoid a flash.

## Local usage

Open `index.html` directly, or serve the folder (`python3 -m http.server`) and visit the printed URL. Deploy the repository as-is on GitHub Pages.
