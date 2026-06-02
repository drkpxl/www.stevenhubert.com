# Portfolio TODOs

Punchlist for things that need your input, decision, or content. Grouped by the kind of work needed. Tick off as you go.

## Content needed per entry

Each item below has an in-file `TODO` block with the same prompt for context. Resolving them means the entry can stand on its own without another pass from me.

- [ ] **`mtn-powder.mdx`** (Mountain Powder): write the recent-redesign chapter: which problems the 2020 build did not solve well now, the reporter-workflow changes that drove the redesign, the headline new features, any new downstream channels, scale figures only if load-bearing, and a one-line lesson.
- [ ] **`ikon-pass-26-27.mdx`**: fill in the UX specifics that did not make the public press: comparison-chart variants tested, refundable-product placement rationale, the specific clicks pulled out of checkout, and the rationale for retiring the standalone Shop Passes page. Pair with screenshots of new homepage chart and checkout before / after.
- [ ] **`ikon-pass-app.mdx`**: name the features your team specifically designed and shipped, separate redesign from new build, and add one or two device screenshots.
- [ ] **`custom-maps.mdx`**: list resorts with installed pieces, the artist or studio partner, the production process at a high level, and one or two photos for the hero. Then I will rewrite the closing paragraph to land on the design-partnership story.
- [ ] **`alterra-weather-relay.mdx`**: confirm production resort coverage and whether to explicitly call out the Docker / docker-compose setup or keep it as generic container framing.
- [ ] **`alterra-corporate-site.mdx`**: drop in homepage hero screenshot and one community / responsibility section screenshot.
- [ ] **`corduroy-design-system.mdx`**: swap the placeholder diagrams for exports from the FY24 leadership deck (workflow diagram and per-resort theme comparison) once the design agent has chosen assets.
- [ ] **`laser-map-studio.mdx`**: optional: drop in customer / revenue scale and Discord member count if you want them load-bearing. The piece reads fine without them.

## Decisions you owe me

- [ ] **Order numbers across all 26 entries.** I appended new entries at 13 to 26. Tier 1 newcomers (Laser Map Studio, 26/27 Ikon Pass, Corduroy, the expanded Mountain Powder) probably belong higher than some of the older agency entries. Tell me the priority order and I will re-shuffle the `order:` field across every file in one pass.
- [ ] **`ecommerce-deployments.mdx` (keep or cut).** The page is honest but reads as scope-managing on a VP-targeting portfolio. Options: keep as-is; replace with a single concrete UX integration story (Inntopia cart redesign, AMP login federation, single-cart prototype); or archive entirely.

## Hero images still placeholdered

These entries currently have a `https://placehold.co/...` URL in `heroImage:`. The site will render the placeholder until you swap in a real asset. Drop a screenshot or render into `public/images/` and update the frontmatter when ready.

- [ ] `laser-map-studio.mdx`
- [ ] `ikon-pass-26-27.mdx`
- [ ] `corduroy-design-system.mdx`
- [ ] `why-did-you-vote.mdx`
- [ ] `frost-obsidian-theme.mdx`
- [ ] `baseline-adventure-maps.mdx`
- [ ] `jabber-game.mdx`
- [ ] `alterra-weather-relay.mdx`
- [ ] `joy-rush.mdx`
- [ ] `alterra-corporate-site.mdx`
- [ ] `ikon-pass-app.mdx`
- [ ] `ecommerce-deployments.mdx`
- [ ] `custom-maps.mdx`

`open-routes.mdx` already uses a real screenshot.

## Source captures already in the repo

I moved the captures I took during research from the repo root into `public/images/source-captures/`. Use or delete as you like.

- `jabber-game.png` (full page of the Jabber question card)
- `open-routes-browse.png` (browse view, public)
- `corduroy-figma-cover.png` (cover slide of the FY24 leadership deck)
- `corduroy-figma-all-slides.png` (overview of all slides at 10% zoom)
- `corduroy-figma-zoom.png` (zoomed view of the value / goal slides)

## Tech and cleanup carry-overs

- [ ] `Post and Arch Planning.md` at repo root: still useful as a planning doc; decide whether to keep it tracked or move to `.gitignore`.
- [ ] `source/_works/*.md` (old Jekyll posts) are superseded by `src/content/work/*.mdx`. Safe to delete once you are confident the new posts cover everything.
- [ ] Decide on the `role:` field. The schema accepts it and the layout renders it as a metadata line above the excerpt, but every new entry currently leaves it blank. Worth a session to populate (your titles per project) if you want that line filled.

## Open content gaps from the planning doc not yet stubbed

I covered every entry from `Post and Arch Planning.md` except these intentional drops:

- **Random Name Selector**: dropped per your call.
- **Photography**: the planning doc says this does not need to be part of the site but should influence the site's aesthetic. That is a design-agent concern rather than a content one, so no entry needed.

If you want either of those revisited, say so.
