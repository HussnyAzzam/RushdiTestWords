The Ultimate Tools Hub
======================

A small React app (Vite) that demonstrates a local JSON "dictionary" database and a simple text tool: "Find Words By letters".

Quick start (macOS / Linux / Windows WSL):

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in your browser (Vite will show the local URL, usually `http://localhost:5173`).

How to use (for non-technical users):
- Open the app and click the "Text" category.
- Click the "Find Words By letters" button.
- Add one or more search terms, select how to match (start / end / contain).
- Combine terms using `AND` or `OR` between rows.
- Click `Search` to see matching words from the local JSON database.

Files of interest:
- [src/components/FindWords.jsx](src/components/FindWords.jsx) — search UI and logic
- [src/data/dictionary.json](src/data/dictionary.json) — local JSON database (100 words)
- [index.html](index.html) and [package.json](package.json) — project entry and scripts

If you want, I can run `npm install` and `npm run dev` here to start the app.
# RushdiTestWords
