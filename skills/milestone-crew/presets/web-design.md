# Preset: web-design

For website design and redesigns: landing pages, marketing sites, visual polish.

## Milestone plan

1. **Direction doc** (no code): mood, references, type, color, layout per
   section, motion ideas, what "cheap" would look like and how to avoid it.
   Written into the state file.
2. **Blockout / layout**: real structure and sections, placeholder visuals,
   correct responsive breakpoints.
3. **Visual pass**: imagery, color, texture, depth. Kill every cheap tell.
4. **Motion and type**: scroll and entrance motion, type scale and rhythm,
   reduced-motion fallback.
5. **Performance and polish**: load budget, first-load JS, copy lint, final QA.

## Dev hooks to add (dev-only, stripped or ignored in production)

- `?at=N`: jump straight to section N with no tween, so QA can screenshot any
  section deterministically.
- `?fps`: log `[fps] NN` to the console once a second, so QA can grep it.

## How QA verifies

Screenshots via headless Chrome CLI, inside the QA subagent only (macOS path
shown; on Linux use `google-chrome` or `chromium`):

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-angle=metal \
  --window-size=1600,1000 --force-device-scale-factor=0.5 \
  --user-data-dir=<scratch> --screenshot=<file> <url>
```

- Why 1600x1000 at scale 0.5: you get the DESKTOP layout in an 800x500 image.
  An 800px-wide window would trigger the mobile layout and give false FAILs.
- Use real waiting (sleep / poll the page), never `--virtual-time-budget`,
  which skips animation and asset timing.
- Logs: add `--enable-logging=stderr --v=0` and grep for what you need
  (e.g. `[fps]`, `Error`). Never dump the whole log.
- Keep screenshots at 800x500 or less, a few per run.
- Check the narrow (mobile) layout on purpose, as its own pass, with a narrow
  window size.
- One browser at a time via lock file; kill it after each run; timeouts.

Also verify:
- Reduced motion (`prefers-reduced-motion`) still gives a complete page.
- Text paints immediately (no waiting on fonts, JS or 3D before headlines show)
  and the load budget holds.
- First-load JS size against the budget.
- Copy lint: typos, placeholder text, inconsistent names, dead links.
- The project's `check` (lint/types) and `build` both pass before any "done".

## Cheap tells for QA to hunt

- Flat grey bands or empty gradients filling space.
- Hard-edged shapes where soft falloff is expected.
- Overlays that look like UI widgets instead of design.
- Text colliding with the nav or other text at any width.
- Stray elements: leftover debug boxes, orphan icons, broken images.
- The visual subject sitting on the same side as the text instead of opposite.

## Gotchas

1. Narrow windows switch to the mobile layout; test desktop scaled down.
2. Headless screenshots taken too early show half-loaded pages; wait for real.
3. Scroll-driven sections need `?at=N`, not simulated scrolling, to be stable.

## Budgets (adjust per project, write the final numbers in the state file)

- First-load JS: set a KB budget in milestone 1 and track it.
- Largest contentful paint: headline text visible without waiting on JS.
- Images: modern formats, sized to their display box.
