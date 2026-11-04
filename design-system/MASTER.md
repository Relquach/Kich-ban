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

## Revision: compact workspace, character profiles, story graph, project files

The author reported broken Vietnamese font rendering and an overly spacious interface. Replace all title/manuscript serif fonts with bundled **Noto Sans** (regular and bold, WOFF; Latin Extended, Vietnamese and combining marks included) and include license. Remove decorative hero text, lower header/section spacing and use plain page labels. Keep light/dark tokens, persistent floating agent and readable 17px manuscript default.

Remove the outline/sort feature and old character-recognition/dialog UI. Use a global project profile editor and explicit profile-grounded generation. Story canvas is author-owned nodes/wires with semantic cause/turn/reveal/sequence edges, keyboard and numeric alternatives to dragging, a detail inspector and undo. The agent receives the structured graph and saved profiles, proposes allowlisted actions and requires author review. File save/open carries all project data; theme/font/zoom are local view preferences, not manuscript data.

Verified by application startup, migration, graph editing, profile request and file round-trip simulations; bundled font cmap covers Vietnamese samples from the bug report. Real browser/device geometry and typography still need visual verification.

## Revision: reference ports, authoring shortcuts and overview

Use explicit (+) output ports with both drag-to-target and a target selector; node menus offer right-click, visible ⋯ and keyboard entry. Pins prevent movement; highlights add an outline and text badge, not color alone. Chapter/profile references carry source IDs, and participation edges have a separate semantic type from causes. Selected nodes attach structured data to agent chat.

Authoring remains a native textarea with a noninteractive, aria-hidden mirror painting color spans. Annotation offsets use UTF-16 end-exclusive ranges and are remapped on edits. Color-specific agent changes operate on validated mark IDs and require a preview. Three bundled font families each have regular/bold/italic/bold-italic files; both textarea and mirror use the same font settings. The styles apply to the whole manuscript view, not inline rich text.

The overview page exposes premise, synopsis and planned ending, saved with project data and sent to the agent. On mobile, six labeled destinations use two rows of three. Project schema v4 is backward-readable from v2/v3.


## Color labels are task-neutral

Red, blue, yellow and purple identify text ranges only. Palette labels and agent metadata contain color names without editorial meanings. The color action opens chat with a neutral scope prefix only when the composer is empty, and preserves an existing draft. The author defines the task in each request; no persistent or implicit color-to-task mapping is applied. The agent is instructed to ask what to do when a color is mentioned without a task. Existing saved marks retain their IDs, colors and offsets; no project migration is needed.
