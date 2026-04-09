# Lukas Portfolio

Static bilingual portfolio built with plain HTML, CSS and JavaScript for direct use on GitHub Pages.

## Project structure

- `index.html`: single-page structure and SEO tags
- `css/style.css`: theme, layout, responsive rules and animations
- `js/i18n.en.js`: English translation data
- `js/i18n.fr.js`: French translation data
- `js/main.js`: rendering, language detection, language switch, mobile menu and typewriter effect
- `assets/images/profile/`: profile photo and Animoji assets used by the site
- `assets/images/logos/`: school, company and experience logos
- `assets/images/icons/`: interface and social icons in `.webp`
- `assets/images/icons-src/`: source SVG files kept for the icon set
- `assets/icons/favicon.svg`: site favicon
- `assets/cv/Lukas_Mauffre_CV.pdf`: linked CV PDF

## Bilingual behaviour

- English is the default language.
- If the browser language starts with `fr`, the site switches to French automatically.
- The manual `EN / FR` switch updates the page instantly without reload.
- The selected language is saved in `localStorage`.

## Local usage

Open `index.html` directly in a browser, or deploy the repository as-is on GitHub Pages.
