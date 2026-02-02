# Antt Hein — One‑Page Portfolio

This folder contains a responsive one‑page portfolio:
- Left sidebar on desktop, top bar (Dark + hamburger) on mobile/tablet
- Smooth scroll, active link highlight, dark mode (saved)
- Projects grid, contact form with mailto fallback
- Back to top button, SEO meta, accessibility skip link

## Files
- `index.html`
- `style.css`
- `script.js`

## Images
Add these files next to the HTML:
- `Image.png`        — your face photo
- `proj1.jpg` `proj2.jpg` `proj3.jpg` — screenshots (≈800×500, ≤200KB)

## Run
Just open `index.html` in any browser.

## Deploy
- **GitHub Pages**: push to a repo, enable Pages (root)
- **Netlify**: drag‑and‑drop the folder to Netlify

## Contact form
Works out‑of‑the‑box with Mail app. To use Formspree, set in `script.js`:
```js
const FORM_ENDPOINT = 'https://formspree.io/f/your_id_here';
```
