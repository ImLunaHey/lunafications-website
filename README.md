# lunafications-website

Landing page for **[@lunafications.blue](https://bsky.app/profile/lunafications.blue)** — a Bluesky bot that DMs you when someone blocks you, adds you to a list or starter pack, or when an account you care about posts.

No app. No website. Follow the account, send it `menu`, and tell it what to watch.

## Stack

- [Astro 5](https://astro.build/) — static site, no framework integrations
- TypeScript everywhere (strict)
- Vanilla TS for the interactive bot demo (no React / hydration cost)
- JetBrains Mono via Google Fonts
- Light/dark theming via `prefers-color-scheme` only (no toggle)

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview  # preview the production build
```

## What's in here

```
src/
  layouts/Layout.astro          # html shell, fonts, system theme
  pages/index.astro             # composes the page
  components/                   # one .astro file per section
    Header / Hero / HowItWorks
    Demo                        # interactive DM simulator
    Capabilities / Commands
    Faq / End / Footer
  scripts/
    bot-engine.ts               # the bot's reply logic (menu, notify, hide, settings)
    demo.ts                     # wires the bot engine to the DOM
  styles/global.css             # the entire design system, ~600 lines
```

The interactive demo runs the **same response logic** as the live bot — `menu`, `notify blocks|lists|all|posts @user`, `hide …`, `settings`. After you turn something on, a sample notification arrives a moment later so you can see exactly what the real one looks like.

## Design

Originally prototyped in [Claude Design](https://claude.ai/design) and re-implemented here. The aesthetic is intentionally minimal: monospaced, lowercase, generous whitespace, thin rules instead of cards.

Two palettes ship with the page:

| | bg | fg | accent rule |
| --- | --- | --- | --- |
| paper (light) | `#f6f5f2` | `#111111` | `#1a1a1a` |
| noir (dark) | `#0e0e0e` | `#f0efea` | `#f0efea` |

They swap purely through `@media (prefers-color-scheme: dark)` over the same set of CSS custom properties.

## The bot itself

This repo is just the marketing page. The bot lives at **[@lunafications.blue](https://bsky.app/profile/lunafications.blue)** on Bluesky — follow it, then DM `menu` to start.
