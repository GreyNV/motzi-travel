# Motzi Travel — Passover 2026 landing page

Static single-page site. No build step: `index.html` is fully self-contained.

## Content provenance

All copy, suite specs, prices, add-on charges, contact details and video ids are taken
from the live Google Sites site (`motzitravel.com` — home, about, pricing,
catering-option, contact-us) and used verbatim or near-verbatim.

**Photography is real, pulled directly from motzitravel.com** (hero, about, catering,
and all 8 gallery tiles — see `images/`). Two gallery labels were adapted because the
source site doesn't have dedicated photos for those subjects:

- "Suite kitchen" → **Suite bedroom** (no kitchen photo exists on the source site)
- "Fitness center" → **Ocean views** (no gym photo exists on the source site)

If real kitchen or fitness-center photos become available, drop them into `images/`
and update the `gallery` array near the bottom of `source/Motzi Travel.dc.html`
(each entry is `{ label, img }`).

The six suite video walkthroughs are live VEED embeds, converted from the share
links on the pricing page (`veed.io/view/<id>` → `veed.io/embed/<id>`).

## What's in this folder

```
index.html     the site — self-contained, no build step, this is what Vercel serves
vercel.json    static config (clean URLs, security headers)
images/        photography used by the site (hero, about, catering, gallery)
source/        editable source (Motzi Travel.dc.html + support.js)
README.md      this file
```

Edit `source/Motzi Travel.dc.html` for changes, then regenerate `index.html`.
`index.html` is compiled output — don't hand-edit it.

## Deploy to Vercel via GitHub

1. Create an empty repo on GitHub (e.g. `motzi-travel-site`).
2. From this folder:

   ```sh
   git init
   git add .
   git commit -m "Motzi Travel landing page"
   git branch -M main
   git remote add origin git@github.com:USERNAME/motzi-travel-site.git
   git push -u origin main
   ```

3. On vercel.com → **Add New → Project** → import the repo.
   - Framework Preset: **Other**
   - Build Command: *(leave empty)*
   - Output Directory: `.` (repo root)
4. Deploy. You'll get a `*.vercel.app` URL immediately.

## Pointing motzitravel.com at it

The domain is currently on Google Sites, so DNS has to move.

1. Vercel → Project → **Settings → Domains** → add `motzitravel.com` and `www.motzitravel.com`.
2. At your registrar, replace the Google Sites records with Vercel's:
   - `A` record on `@` → `76.76.21.21`
   - `CNAME` on `www` → `cname.vercel-dns.com`
3. Wait for propagation. Vercel issues the SSL cert automatically.

Confirm Vercel's current IP/CNAME values in the dashboard before editing DNS — they
occasionally change. Keep the Google Site up until the Vercel deploy is verified.

## Wiring up the inquiry form

The form is the site's primary conversion goal but is currently **client-side only** —
it shows a thank-you state and sends nothing. Options:

- **Formspree / Basin** — swap the submit handler for a `POST` to their endpoint. No backend.
- **JotForm** — you already use it for catering; a second form keeps submissions in one place.
- **Vercel Serverless Function** — add `api/inquire.js`, send via Resend or SendGrid.

## Notes

- The catering section links out to `pci.jotform.com/motzitravel/2026-motzi-pesach-order-form`.
- Suite prices are shown as "Total / Incl. tax & resort fee", matching the pricing page.
