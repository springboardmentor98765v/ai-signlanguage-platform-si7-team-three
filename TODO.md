# Task TODO: Move existing React/Vite code into GitHub repo Frontend folder

## Step 1: Prepare local build
- [x] Run `npm install`
- [x] Run `npm run build`

## Step 2: Move local project files into `Frontend/`
- [x] Create `Frontend/` folder
- [ ] Ensure all root Vite files are moved into `Frontend/` (index.html, src/, public/, configs, package.json/lock)
- [ ] Keep `.git/` at repo root

## Step 3: Git sync and push to GitHub
- [ ] Add/confirm correct `origin`
- [ ] `git pull origin main --rebase` (or correct branch)
- [ ] Commit the `Frontend/` structural change
- [ ] `git push -u origin main`

## Step 4: Verify on GitHub
- [ ] Confirm `Frontend/` contains runnable Vite app
- [ ] Confirm build/dev works when running from within `Frontend/`

