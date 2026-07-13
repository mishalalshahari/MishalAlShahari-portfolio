# Mishal Alshahari — Portfolio

A single-page portfolio site. Pure HTML/CSS/JS — no build tools, no dependencies.
Open `index.html` in a browser and it just works.

## Files

| File | Purpose |
|---|---|
| `index.html` | All content — this is the only file you need to edit day-to-day |
| `styles.css` | Design system (colors, fonts, layout) |
| `script.js` | Copy-email button, scroll animations, nav highlighting |
| `profile.svg` | Placeholder profile picture — replace with your photo |
| `favicon.svg` | Browser tab icon (MA monogram) |

## Content status

Filled from Mishal's resume (Feb 2026): TCS experience, StayWe + sentinelAI projects
with live links, LeetCode / CodeUtsava achievements, B.Tech (United Institute of
Technology), real GitHub/LinkedIn/LeetCode links, and `resume.pdf`.

**Still placeholder — replace when ready (all in `index.html`):**

1. **Photo** — replace `profile.svg` with your photo: add e.g. `photo.jpg` to this
   folder and change the `<img src="profile.svg" ...>` in the hero to `src="photo.jpg"`.
   Remove `filter: grayscale(100%)` in `styles.css` (`.hero-photo-frame img`) if you
   want color.
2. **XII / X school cards** in Education — school names, years, and percentages
   (currently "Your School Name · Year" and "-- %"). Delete the two cards if you'd
   rather not show school results.
3. **Project GitHub icons** currently link to your GitHub profile — point them at the
   specific repos if they're public.

## Animations

The site uses **GSAP** (ScrollTrigger, SplitText, ScrambleText) and **Lenis** smooth
scrolling, loaded from the jsDelivr CDN — no npm install needed. All animation code
lives in `script.js`:

- Ink-curtain **preloader** with a loading counter
- Hero: letter-by-letter masked title reveal, scramble-text kicker, clip-path photo
  reveal, elastic badge pop, 3D photo tilt on hover
- **Velocity-reactive marquee** ribbon (speeds up and skews as you scroll)
- Scroll-triggered reveals for every section: masked headings, staggered cards,
  popping chips, elastic medals, parallax watermarks
- **Custom cursor** (orange dot + ring) with **magnetic buttons** — desktop only
- Navbar hides on scroll down / returns on scroll up; orange scroll progress bar

Safety nets built in: if the visitor has *reduced motion* enabled or the CDN is
blocked, the page renders fully static and readable. To remove the custom cursor,
delete `buildCustomCursor()` in `script.js`.

## Deploying to GitHub Pages with a custom domain

1. Create a GitHub repo and push this folder to it (branch `main`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Wait for the first deploy — the site is live at `https://<username>.github.io/<repo>/`.
4. **Custom domain**: still in Settings → Pages, enter your domain (e.g. `mishal.dev`)
   and save — GitHub creates a `CNAME` file in the repo.
5. At your DNS provider:
   - **Apex domain** (`mishal.dev`): four `A` records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **www subdomain**: `CNAME` record → `<username>.github.io`
6. Back in Settings → Pages, tick **Enforce HTTPS** once the DNS check passes
   (can take a few minutes to a few hours).

The `.nojekyll` file in this folder tells GitHub Pages to serve files as-is.

Alternatives: **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or
connect the repo. No build command needed — it's a static site.
