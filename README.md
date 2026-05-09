# Antt Hein — One‑Page Portfolio

This folder contains a responsive one-page portfolio:
- Left sidebar on desktop, top bar (dark mode + hamburger) on mobile/tablet
- Smooth scroll, active link highlight, dark mode persistence
- Projects grid, modals, bot assistant, certificate gallery
- Contact form with mailto fallback
- CV email modal (EmailJS)
- Image optimization (lazy-loading, `picture` WebP fallback, `srcset`)
- Basic analytics event tracking (project modal, CV flow, contact submit)
- Back-to-top button, SEO meta, accessibility skip link

## Files
- `index.html`
- `style.css`
- `script.js`
- `assets/` (certificates, CV)
- `images/` (profile/avatar/icons)
- `sitemap.xml`
- `robots.txt`
- `tests/smoke.spec.js`
- `playwright.config.js`

## Images
Add these files next to the HTML:
- `Image.png`        — your face photo
- `proj1.jpg` `proj2.jpg` `proj3.jpg` — screenshots (≈800×500, ≤200KB)

## Run
Just open `index.html` in any browser.

## Automated smoke tests
```bash
npm install
npm run test:smoke
```

## Deploy
- **GitHub Pages**: push to a repo, enable Pages (root)
- **Netlify**: drag‑and‑drop the folder to Netlify

## Contact form
Works out-of-the-box with Mail app. To use Formspree, set in `script.js`:
```js
const FORM_ENDPOINT = 'https://formspree.io/f/your_id_here';
```

## CV email modal (EmailJS)
Set EmailJS values in `script.js`:
```js
const EMAILJS_CONFIG = {
  publicKey: 'your_public_key',
  serviceId: 'your_service_id',
  templateId: 'your_template_id'
};
```
For safety, configure EmailJS domain restrictions and rate limits in your EmailJS dashboard.

## Manual smoke test checklist
- Page loads without console errors
- Desktop sidebar nav highlights active section while scrolling
- Mobile hamburger opens/closes and section links scroll correctly
- Dark mode toggles and persists after refresh
- Project filter buttons show/hide cards correctly
- Project modal opens, traps `Tab` focus, closes with `Esc`, and returns focus to trigger
- Certificate modal opens, supports arrow navigation, traps `Tab` focus, closes with `Esc`, and returns focus
- CV modal validates email, enforces cooldown, traps `Tab` focus, closes with `Esc`, and returns focus
- Contact form validation messages appear for invalid fields
- External links open in a new tab safely (`noopener noreferrer`)
