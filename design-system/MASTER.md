# Mạch Văn — Writing workspace

Based on [UI/UX Pro Max SKILL.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), read and applied for this redesign.

Verified database match: `writing editor --domain product` → **Notes & Writing App** → Minimalism & Swiss Style + Flat Design, editor focused, clean cream/white with minimal accent. The generic design-system landing recommendation was not applied to this workspace. Existing sage accent is retained for continuity. System UI fonts and local serif prose replace remote fonts for offline startup.

## Structure

- Persistent navigation and chapter list, one large writing surface, compact editorial tools.
- Floating modeless AI agent in the same corner on every screen. Open/close button, Escape, Alt+J. Minimize retains draft input, response and pending review. Keyboard focus that would sit behind the panel closes the panel.
- Mobile navigation remains labeled; chapters remain reachable as a horizontal list. Agent adapts to viewport height/landscape and safe-area insets. Editor remains the primary task.
- Theme preferences: light / dark / system. Resolve before CSS, persist separately from manuscript. System theme follows OS only when system mode selected.

## Tokens

All component colors use semantic CSS tokens in `static/style.css`. Sage/cream light theme; desaturated sage/charcoal dark theme. Standard UI text uses system sans serif; manuscript uses Georgia/Times New Roman at 16–26px, default 18px and line height 2. Content width is limited by editor/tools grid. Layout breakpoints: 767, 1023, 1199, 1550 CSS px.

Verified computed color ratios using WCAG luminance formula (not visual browser validation):

| Pair | Light | Dark |
| --- | --- | --- |
| Primary text / paper | 14.19 | 12.88 |
| Secondary text / paper | 5.64 | 8.28 |
| Placeholder text / paper | 4.59 | 6.96 |
| Secondary text / background | 5.21 | 9.55 |
| Selected text / accent surface | 7.54 | 7.98 |

## Interaction

Local inline SVG icon family, labels for icon controls, visible keyboard focus, aria-pressed for editor mode, aria-expanded for floating agent, live feedback without moving keyboard focus. Only transform/opacity for panel entrance; honor prefers-reduced-motion. No external fonts, frameworks or icon CDNs.

## Performance

Debounce draft serialization/write 450ms; flush on pagehide/visibility hidden. Debounce word count 180ms and chapter-title list updates 250ms. Group undo input within 700ms and cap all undo snapshots at 4 MiB. Bound agent history to 24 entries/120k characters and rendered log to 80 blocks; retain at most one actionable review plan. A client single-flight gate plus server lock prevent parallel local inference. Keep Ollama model warm for five minutes; avoid duplicating the whole chapter in agent editing scope. These are implementation choices informed by the skill quick-reference performance defaults; the two targeted performance database searches returned no exact match.

## Verification limits

API, execution and UI state tested with mocks. No browser automation tool was available in this environment, so responsive geometry, zoom, focus appearance and real model throughput still need browser/device verification. Do not describe simulated UI checks as browser QA or claim measured Qwen speed improvements.
