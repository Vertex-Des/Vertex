# Vertex

**Live site:** [vertex-des.github.io/Vertex](https://vertex-des.github.io/Vertex/)

Vertex is a student-run free wesbite that teaches high schoolers how to use [Desmos](https://www.desmos.com/) — the free graphing calculator built into the Digital SAT — as a primary problem-solving tool, not just something to double-check work with.

Most prep resources teach SAT math the same way they did before every test-taker had a graphing calculator on screen. Vertex flips that: graph an intersection instead of solving a system by hand, run a regression instead of guessing an equation, read a stats list instead of computing standard deviation by formula.

## What's on the site

- **Learn Desmos** — a hands-on tour of the calculator (graphing, sliders, regressions, statistics) plus a cheat sheet of copy-pasteable prompts for tricks that come up over and over (`mean()`, `median()`, `stdev()`, `distance()`, regression syntax, and more).
- **Practice** — 51 Hard-difficulty Digital SAT math problems, pulled verbatim from the College Board Question Bank and organized into the four SAT math domains:
  - Algebra (15)
  - Advanced Math (16)
  - Problem-Solving & Data Analysis (10)
  - Geometry & Trigonometry (10)

  Every problem has a live, embedded Desmos calculator to try it yourself in, instant answer checking, and a step-by-step walkthrough (with a second live calculator pre-loaded to the solving technique) if you get stuck.

Vertex is intentionally scoped to problems that are actually solvable with Desmos — not full SAT prep.

## Tech stack

Plain HTML/CSS/JS — no build step, no framework, no backend.

- `index.html`, `learn.html`, `practice.html`, `about.html` — the four pages
- `css/style.css` — all styling (green/white theme, Inter + Source Serif 4 typefaces)
- `js/practice.js` — renders problem cards from `data/problems.json`, handles answer checking and the live Desmos embeds
- `js/learn.js` — the single Desmos embed on the Learn page
- `data/problems.json` — every problem's question text, answer, and Desmos setup
- Desmos is loaded via their public [Graphing Calculator API](https://www.desmos.com/api/v1.9/docs/index.html)

## Running it locally

No build step or dependencies — just serve the folder:

```bash
python3 -m http.server 8420
```

Then open `http://localhost:8420`.

## Deployment

The site is static and deploys via GitHub Pages directly from the `main` branch. Pushing to `main` updates the live site automatically within a minute or two.

## Founders

Vertex was founded by Nikhil Cherukuvada and Ignatios Darakos.
