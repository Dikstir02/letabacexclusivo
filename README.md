# Le Tabac Exclusivo — UAE

Independent cigar maison for **Cuban and non-Cuban (World)** cigars.

## Structure
- `index.html` — Maison / Collections (Cuban vs World tabs) / Rituals / Journal / Boutiques / Atelier
- `styles.css` — ivory + ink + brass maison system (Fraunces + Inter)
- `script.js` — entry gate, tabs, rituals carousel, Leaflet boutiques, reservation, concierge
- `js/site-settings.js` — contact, audio, boutique placeholders
- `js/rituals-data.js` — rituals carousel data
- `admin/` — rituals + settings editor, exports copy-paste JS files

## Local preview
Use any static server, e.g. `npx serve .` then open the URL.

## Admin
Open `/admin/` — default password is `habano-admin` (change `ADMIN_HASH` in `admin/admin.js`).
Edits save to browser storage; use Copy buttons to paste into `js/*` files.
