# Lukas Portfolio

Static bilingual portfolio built with plain HTML, CSS and JavaScript for direct use on GitHub Pages.

## Project structure

- `index.html`: single-page structure and SEO tags
- `css/style.css`: theme, layout, responsive rules and animations
- `js/i18n.js`: centralised bilingual content and structured portfolio data
- `js/main.js`: rendering, language detection, language switch, mobile menu and typewriter effect
- `assets/images/profile/`: profile photo and Animoji placeholders
- `assets/images/logos/`: school, company and experience logos
- `assets/images/icons/`: interface and social icon placeholders in `.webp`
- `assets/icons/favicon.svg`: site favicon
- `assets/cv/Lukas_Mauffre_CV.pdf`: CV placeholder file

## Bilingual behaviour

- English is the default language.
- If the browser language starts with `fr`, the site switches to French automatically.
- The manual `EN / FR` switch updates the page instantly without reload.
- The selected language is saved in `localStorage`.

## Replace assets

- Profile photo: replace `assets/images/profile/profile-photo.webp`
- Header Animoji: replace `assets/images/profile/animoji-header.webp`
- Hero Animoji: replace `assets/images/profile/animoji-hero.webp`
- ECE logo: replace `assets/images/logos/ece-logo.webp`
- OMNES London logo: replace `assets/images/logos/omnes-london-logo.webp`
- UFCV logo: replace `assets/images/logos/ufcv-logo.webp`
- DIRISI logo: replace `assets/images/logos/dirisi-logo.webp`
- CV: replace `assets/cv/Lukas_Mauffre_CV.pdf`
- Interface and social icons: replace the files in `assets/images/icons/`

You can keep the same filenames to avoid changing the code.

## Local usage

Open `index.html` directly in a browser, or deploy the repository as-is on GitHub Pages.
