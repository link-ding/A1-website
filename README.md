# A1-website

## Website

The bilingual Academy One website is served from `Academy One.dc.html`. Supporting SEO landing pages live in route-based folders such as `tutoring/maths/`, `locations/chatswood/`, and `resources/hsc-scaling/`.

Run the site locally:

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:4173/`.

Regenerate the static SEO pages after editing their content source:

```bash
npm run generate:seo
```

Run the automated tests:

```bash
npm test
```
