# Lukas Portfolio

Static bilingual portfolio built with plain HTML, CSS and JavaScript for direct use on GitHub Pages.

## Project structure

- `index.html`: single-page structure, SEO tags and icon sprite
- `css/style.css`: theme, layout, responsive rules and animations
- `js/i18n.js`: centralised bilingual content and structured portfolio data
- `js/main.js`: rendering, language detection, language switch, mobile menu and typewriter effect
- `assets/images/`: profile photo, Animoji and logo placeholders
- `assets/icons/favicon.svg`: site favicon
- `assets/cv/Lukas_Mauffre_CV.pdf`: CV placeholder file

## Bilingual behaviour

- English is the default language.
- If the browser language starts with `fr`, the site switches to French automatically.
- The manual `EN / FR` switch updates the page instantly without reload.
- The selected language is saved in `localStorage`.

## Replace assets

- Profile photo: replace `assets/images/profile-photo.jpg`
- Animoji: replace `assets/images/animoji.png`
- ECE logo: replace `assets/images/ece-logo.png`
- OMNES London logo: replace `assets/images/omnes-london-logo.png`
- UFCV logo: replace `assets/images/ufcv-logo.png`
- DIRISI logo: replace `assets/images/dirisi-logo.png`
- CV: replace `assets/cv/Lukas_Mauffre_CV.pdf`

You can keep the same filenames to avoid changing the code.

## Local usage

Open `index.html` directly in a browser, or deploy the repository as-is on GitHub Pages.
