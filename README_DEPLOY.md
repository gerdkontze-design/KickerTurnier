Deployment instructions
=======================

This repository is a Vite + React single-page app. Below are simple options to publish it to the internet.

1) GitHub Pages (recommended automated)
- Ensure your repo is pushed to GitHub and your default branch is `main` (or edit `.github/workflows/deploy.yml` to use your branch).
- The workflow `.github/workflows/deploy.yml` will build the app and push the `dist/` contents to the `gh-pages` branch using the built-in `GITHUB_TOKEN`.
- After the workflow runs, enable GitHub Pages in the repository settings and select the `gh-pages` branch as the source. The site will be available at `https://<your-user>.github.io/<repo>`.

Notes:
- If your site will be served from a sub-path (e.g. `https://<user>.github.io/<repo>`), set the `base` option in `vite.config.js` to `'/<repo>/'` before building.

2) Vercel / Netlify (zero-config)
- Create an account at Vercel or Netlify and connect the GitHub repo. The provider will detect the project as a Vite app.
- Build command: `npm run build`
- Publish directory: `dist`

3) Manual: build & upload
- Run locally:

```bash
npm ci
npm run build
# then upload the `dist/` directory to any static hosting (S3, CDN, Netlify drop, etc.)
```

If you want, I can also:
- add a `vite.config.js` with a configurable `base` option,
- create a small GitHub Pages README badge, or
- set up a Netlify `netlify.toml` file.
