# Chinab & Siddharth: wedding invitation

A static site: upload this folder to any static host (Netlify, Vercel, GitHub Pages, S3). No build step. The `tools/` folder is not needed on the host.

## Changing things

- **Wording, dates, venues, phone:** `js/content.js`, one block for Hindi and one for English.
- **RSVP delivery:** guests light the diya, choose an option and send a pre-typed WhatsApp message to the number in `config.phone`; the messages are in `js/content.js`. To also receive replies elsewhere, set `config.rsvpEndpoint` to a URL that accepts a JSON POST of `{name, choice, guests, lang}`.
- **Home addresses are public on this page.** It is marked `noindex` so search engines skip it, but anyone with the link can read them.

## Motion

`prefers-reduced-motion`, or a browser without WebGL2, gets a calm version with still paintings and no pinned scenes. Add `?calm` to the URL to preview it, and `?lang=en` to open in English.

## Artwork

`assets/scene/` holds depth layers cut from the two supplied paintings by `tools/build_scene1.py`, `tools/build_scene2.py` and `tools/bake_plates.py`. `assets/art/` holds the murals, jharokha and Jabalpur scene painted by `tools/art.mjs` and rendered through headless Chrome with `tools/render_art.sh`.
