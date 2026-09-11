# Motzi Travel website

## Current implementation

The site defaults to Passover 2027, with dates to be announced and the catering order button hidden. Existing room and add-on prices are retained for review. `/admin` edits the year, arrival/departure dates, room prices, availability, add-on prices, and ordering URL. Unavailable room categories display SOLD OUT and are removed from inquiry options.

The original source and prior logo/hero improvements are preserved. Native MP4 players replace blocked VEED iframes. Food photography is illustrative, rather than a claim about the actual catering menu.

**Local implementation is tested. It has not been deployed, and a live Google Sheet is not connected.**

## Connect Google Sheets and admin access

1. Create or choose a private Google Sheet. Add tabs named exactly `Settings` and `Inquiries`.
2. Leave `Settings!A1` empty. The first admin save writes the shared website configuration there. Do not put other content in that cell.
3. Put these column headings in `Inquiries!A1:L1`, in order:

   `Submitted at | Name | Email | Phone | Suite | Guests | Add-on | Message | Marketing consent | Season year | Arrival | Departure`

4. In Google Cloud, enable the Google Sheets API and create a service account. Create a JSON key and share this one spreadsheet with the key's `client_email` as Editor. Domain-wide delegation is not needed.
5. In the Vercel project's environment settings, set:

   - `GOOGLE_SHEET_ID`: the ID between `/d/` and `/edit` in the sheet URL.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` from the key.
   - `GOOGLE_PRIVATE_KEY`: `private_key` from the key (real newlines or literal `\n` both work).
   - `ADMIN_PASSWORD`: your chosen non-empty admin password.

   Keep credentials in hosting environment variables, never browser code or committed files. Do not paste the private key into chat.

6. Deploy from the **repository root**, with Framework Preset Other and Output Directory `deploy`. The root `vercel.json` routes `/` through the server so the year/dates in page metadata also update. Do not deploy only the `deploy` folder: that would omit the API and durable saving.
7. Open `/admin`, sign in, review the carried-forward prices, and save. Refresh the public site in another browser to verify persistence. Leave both dates and the order URL blank until announced.
8. Send a clearly marked test inquiry, verify its row appears in the private sheet, and remove that test row manually afterward. A successful submission is acknowledged only after Google confirms the write. Fields use RAW input to prevent spreadsheet formula execution.

The optional marketing checkbox is recorded independently from the inquiry. No marketing messages are sent automatically. No inquiry data is exposed through a public read endpoint.

When credentials are absent, the public site shows the default season and submissions fail visibly with contact alternatives; admin sign-in works with ADMIN_PASSWORD, but settings are read-only and saving is unavailable. When configured storage fails, the server returns a contact fallback rather than advertising stale availability.

For public launch, enable hosting firewall/rate limits for POST `/api/admin` and `/api/inquire` to manage automated abuse. The form includes a honeypot, length/type checks, origin checks, and server-only Google credentials. The admin password is held only in the current page's memory and cleared on sign-out or reload. Changes are last-save-wins, so coordinate edits if several people administer the site.

## Editing and checking

- Edit `deploy/source/Motzi Travel.dc.html`, then run `node scripts/build.mjs`. The build preserves the existing bundled runtime and regenerates its template; do not edit the compiled template manually.
- `data/defaults.json` contains the initial server settings. If changing the defaults in source, keep this file and the source's DEFAULTS object aligned. Day-to-day changes belong in admin.
- `node scripts/preview.cjs` serves a local preview at http://127.0.0.1:4173, including API routes and video range requests. It reads environment variables; it does not load a .env file automatically.
- `node scripts/api-check.cjs` tests authentication, validation, saved settings, inquiries, consent, metadata, and failure behavior against a mocked Google API. It does not write to Google.
- `node scripts/browser-check.cjs` checks native video playback, mobile width, sold-out UI, ordering URL, inquiry failure, and admin saves. Its admin/settings service is mocked. The script uses the bundled local Playwright installation; adapt its library/browser paths on another machine.
- `node scripts/verify-hero-readability.mjs` checks the existing logo/contrast treatment.

## Assets and references

Original property photography and logo remain under `deploy/images`. Six provided walkthrough videos are copied into `deploy/videos`, mapped by their filenames to the existing six suite categories. The unused one-bedroom video remains in the repository root. No third-party video iframe is required; direct video links are provided as a fallback.

Food photo: [Succulent Roasted Chicken with Vegetables, Pexels](https://www.pexels.com/photo/succulent-roasted-chicken-with-vegetables-31233881/), used under the [Pexels license](https://www.pexels.com/license/). Saved as `deploy/images/catering-food.jpg`. Replace it with the business's own catering photography when available.

Implementation references: [Google Sheets append API](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append), [Google service-account authentication](https://developers.google.com/identity/protocols/oauth2/service-account), [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).

## Phase two

See [the video preview implementation notes](../docs/phase-two-video-previews.md) for the VEED investigation and the implemented silent three-second loops with click-to-enable-sound full playback.

## Detailed Google Sheets setup for later

Do not enable the connection until the existing spreadsheet layout has been reviewed. The website and video review can proceed before this integration is configured; inquiries cannot be saved yet and the form will show an error with phone/email alternatives.

### 1. Choose and inspect the destination

Send the spreadsheet link when ready. Before writing anything, inspect its tab names, header rows, data ranges, formulas, protected ranges, merged cells, and existing records. Confirm whether Settings and Inquiries should be new tabs or whether existing tabs should be reused. Do not rename tabs, overwrite headings, clear cells, or insert a configuration value into an occupied A1 cell without agreeing on the destination.

The current implementation assumes:

| Purpose | Current target | Data |
| --- | --- | --- |
| Website settings | `Settings!A1` | One JSON string containing season, prices, availability, and order URL |
| Inquiry records | `Inquiries!A:L` | One appended row per submission |

Inquiry columns in their current order:

| Column | Value |
| --- | --- |
| A | Submission timestamp, ISO format in UTC |
| B | Full name |
| C | Email address |
| D | Phone number |
| E | Suite interest |
| F | Party size |
| G | Add-on selection |
| H | Message |
| I | Marketing consent, Yes or No |
| J | Season year |
| K | Arrival date, blank until announced |
| L | Departure date, blank until announced |

No existing worksheet structure has been inspected or approved yet. These are defaults, not a requirement to restructure your current file.

### 2. Create the Google Cloud credentials

1. Sign in to [Google Cloud Console](https://console.cloud.google.com/) with the account that will manage the integration.
2. Select an existing appropriate project or create one for Motzi Travel.
3. Open APIs & Services → Library, find Google Sheets API, and enable it.
4. Open IAM & Admin → Service Accounts → Create service account. Give it a recognizable name such as Motzi Website. Spreadsheet access will be granted by sharing the sheet; project-wide Editor/Owner access and domain-wide delegation are not needed for this integration.
5. Open the service account → Keys → Add key → Create new key → JSON. Store the downloaded file securely. If your organization disallows service-account keys, stop here and arrange an approved authentication method; do not relax organization policies merely for this setup.
6. Note `client_email` and `private_key` in the JSON file. Never commit this file, put it in `deploy`, or send the private key in chat.

### 3. Share only the intended spreadsheet

1. Open the destination spreadsheet in Google Sheets and click Share.
2. Add the service account's `client_email` with Editor access. Keep the spreadsheet private; public link sharing is unnecessary.
3. Copy the spreadsheet ID from `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
4. If using an empty new sheet, create Settings and Inquiries tabs and the headings listed above. If using an existing sheet, first complete the mapping step below instead.

### 4. Adapt output targets to an existing worksheet

When the file is supplied, prepare a concrete mapping of form fields to its existing headers and confirm where new rows should go. Preserve unrelated columns and any formula-generated values. Check whether the records form one contiguous table: Google append detects the table in the supplied range, so blank rows, multiple tables, and formula columns can change where data lands.

Implementation locations for the later adaptation:

- `lib/store.js`, `settings()`: reads the configuration location, currently Settings!A1.
- `api/settings.js`: writes the same configuration location. Change read and write together.
- `api/inquire.js`: defines the append range and the explicit row order. Change these to match the reviewed destination headers.
- `scripts/api-check.cjs`: verifies the resulting column mapping and confirms unrelated fields are not written.

For reordered contiguous columns, build each row in the destination's column order rather than relying on the current field order. For separated columns or columns containing formulas, implement a suitable targeted write strategy after inspecting the sheet; do not append empty strings across formula columns. Keep the configuration in a dedicated unused tab/cell unless a different safe target is agreed. Keep ranges in server configuration, never accept arbitrary sheet IDs/ranges from the public inquiry form.

These targets are currently code-defined, not editable in the admin interface. Making them configurable can be done during the integration after the file structure is known. Do not assume an environment variable for tab/range selection already exists.

### 5. Add Vercel environment variables

Open the linked Vercel project → Settings → Environment Variables. Add the four variables described earlier in this README. Use the spreadsheet ID alone for GOOGLE_SHEET_ID, the service-account email for GOOGLE_SERVICE_ACCOUNT_EMAIL, and the entire PEM private key for GOOGLE_PRIVATE_KEY, including its BEGIN/END lines. Literal backslash-n sequences from JSON or actual newlines are supported. Set ADMIN_PASSWORD to your chosen non-empty password.

Apply the variables to Production. If testing through Vercel Preview deployments, use a separate test spreadsheet and its credentials for Preview to avoid mixing test contacts with real leads. Redeploy after changing environment variables. This site's local preview reads process environment variables and does not automatically read `.env` files.

### 6. Verify without risking existing data

1. Test the mapping against a test copy or dedicated test tab first.
2. Sign in at /admin, change a harmless test value, save, and verify the settings cell and public page agree after refresh. Restore the intended value.
3. Send one clearly marked inquiry with consent checked and one with it unchecked; check the exact columns, timestamps, phone formatting, and consent values.
4. Verify existing records, formulas, protections, and unrelated columns are unchanged.
5. Simulate denied sheet access in the test environment and ensure the site does not show a false success message. Restore access afterward.
6. Remove only the identified test records, then apply the approved production destination mapping.

### Troubleshooting

- Admin password rejected: check ADMIN_PASSWORD in the correct Vercel environment, exact value, and redeployment.
- “Connect Google Sheets”: one or more of the three Google variables is missing.
- Cannot read settings or save inquiries: check API enablement, spreadsheet ID, exact tab/range names, and Editor sharing with the service-account email.
- Authentication fails: check the private key's newlines, matching client_email, revoked keys, and deployment environment.
- Rows appear in the wrong place: stop submissions to that destination and inspect the append range/table layout before changing the mapping. Do not clear the sheet to repair it.
- For deeper diagnosis, inspect server-side deployment logs without logging private keys, access tokens, passwords, or full inquiry payloads.

Google reference: [service-account setup and authorization](https://developers.google.com/identity/protocols/oauth2/service-account), [Sheets append behavior](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append).
