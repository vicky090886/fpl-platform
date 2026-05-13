# FPLwala Deploy Checklist

Use this checklist each time you ship changes.

## 1) Push to GitHub

1. Confirm branch:
   - `git branch --show-current`
2. Check pending changes:
   - `git status --short`
3. Commit:
   - `git add -A`
   - `git commit -m "your message"`
4. Push:
   - `git push origin main`

## 2) Deploy on Railway

1. Open Railway dashboard.
2. Open project/service connected to:
   - `https://github.com/vicky090886/fpl-platform.git`
3. Confirm latest commit hash is visible in Deployments.
4. If auto-deploy did not run, click `Redeploy` on latest `main`.
5. Wait until deployment status is `Success`.

## 3) Smoke Test Live App

1. Open homepage:
   - `https://fplwala.up.railway.app/`
2. Verify SEO endpoints:
   - `https://fplwala.up.railway.app/robots.txt`
   - `https://fplwala.up.railway.app/sitemap.xml`
3. Confirm page title and description in browser source.

## 4) Google Search Console (SEO)

1. Open:
   - `https://search.google.com/search-console/about`
2. Add property using `URL prefix` (if not already added):
   - `https://fplwala.up.railway.app/`
3. Submit sitemap:
   - `https://fplwala.up.railway.app/sitemap.xml`
4. Use URL Inspection on homepage and click `Request Indexing`.

## 5) Quick Troubleshooting

1. `robots.txt` or `sitemap.xml` missing:
   - Ensure files exist in `public/` and redeploy.
2. Old content still visible:
   - Hard refresh browser or wait a few minutes for edge cache.
3. Not indexed yet:
   - Check `site:fplwala.up.railway.app` on Google after 24-72 hours.

