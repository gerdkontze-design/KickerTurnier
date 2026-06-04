# Git deployment — quick reference

This file contains the Git commands I ran locally and short instructions for pushing the repository to GitHub (so Actions can deploy the `dist/` build to GitHub Pages) or for using Netlify/Vercel.

## Local commands I executed here
The repository was initialized and the current workspace committed locally:

```bash
git init
git config user.email "action@local"
git config user.name "AutoCommit"
git add -A
git commit -m "Prepare release for deployment"
git branch -M main
```

You can now add a remote and push to GitHub:

```bash
# replace <your-remote-url> with your repo URL (SSH or HTTPS)
git remote add origin <your-remote-url>
git push -u origin main
```

## If you want the automatic GitHub Pages deploy (Actions)
1. Ensure the repository is pushed to GitHub (`main` branch).  
2. The workflow `.github/workflows/deploy.yml` is already present and will run on push to `main`. It builds and publishes `dist/` to the `gh-pages` branch.  
3. After the Action completes, enable GitHub Pages in the repository settings and select the `gh-pages` branch as the source (if not selected automatically).  

### Note about `BASE` (if deployed under a subpath)
- If your site will be served from `https://<user>.github.io/<repo>/` set `BASE=/<repo>/` during build. Example (local):

```bash
BASE=/my-repo/ npm run build
```

In the GitHub Action you can set `BASE` for the build step, e.g.: 

```yaml
- name: Build
  env:
    BASE: '/my-repo/'
  run: npm run build
```

## Netlify / Vercel
- Netlify: connect the repo in the Netlify UI (or drop a `dist.zip`). Build command `npm run build`, publish directory `dist`. `netlify.toml` is already present.  
- Vercel: connect the repo, set build command `npm run build` and output directory `dist`.

If you want I can add the remote and push for you — provide the GitHub repo URL (SSH or HTTPS) or let me create a repo (I will need your confirmation and credentials locally to push).  
