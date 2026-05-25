# Math Drill — Website

Official website for the **Math Drill** Android app.

Live at: `https://morningapplabs.github.io/math-drill-site/`

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/index.html` | Landing page with features, Pro pricing, download |
| Privacy Policy | `/privacy.html` | Required by Google Play |
| Support / FAQ | `/support.html` | Help & contact |
| 404 | `/404.html` | Custom error page |

## Structure

```
math-drill-site/
├── index.html          ← Main landing page
├── privacy.html        ← Privacy policy
├── support.html        ← Support & FAQ
├── 404.html            ← Custom 404
├── css/
│   └── style.css       ← All styles (dark/light mode, responsive)
├── js/
│   └── main.js         ← Theme toggle, FAQ accordion, animations
└── .nojekyll           ← Tells GitHub Pages not to use Jekyll
```

## Publishing to GitHub Pages

See the main project guide: `PLAYSTORE_LAUNCH_GUIDE.md`

### Quick steps:
1. Push this folder to your GitHub repository
2. Go to your repo → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` → folder: `/ (root)` → Save
5. Your site will be live in ~1 minute

## After Publishing

Update these placeholders:
- `index.html` → replace `https://play.google.com/store` with your real Play Store URL
- `index.html` → replace `og:url` meta tag is already set to `https://morningapplabs.github.io/math-drill-site/` ✅
- `support.html` + `privacy.html` → email is already set to `morningapplabs@gmail.com` ✅
