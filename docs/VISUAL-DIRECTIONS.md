# PhraseGarden Gate 1 visual directions

Status: Gate 1 selection recorded  
Batch: `gate1-v1`  
Updated: 2026-07-23  
Selection: Woven Conversation, displayed concept 2, selected by the user on 2026-07-23

## Package contract

**OBJECTIVE**  
Present exactly three coherent, accessible visual directions for PhraseGarden so the user can select one visual target before any application scaffolding or UI implementation.

**SOURCE OF TRUTH**  
`PRODUCT.md`, `ARCHITECTURE.md`, `RECIPE-SCHEMA.md`, `EVALUATION.md`, accepted ADR-007 in `DECISIONS.md`, and the user-required direction names: Warm Garden, Woven Conversation, and Resonance Atlas.

**IN SCOPE**

- One independent desktop primary Builder concept image for each direction, targeted at a 1440 × 1024 viewport.
- A complete written specification for Homepage, Builder, Generated-prompt Review, Local Recipe Library, mobile and desktop behavior, typography, color/contrast, focus, support tiers, English/Japanese text, and reduced motion.
- Selection trade-offs and a cross-direction acceptance matrix.

**OUT OF SCOPE**

- Blending directions, selecting a winner, a final design contract, responsive implementation, application scaffolding, source code, dependencies, production assets, browser testing, or deployment.
- Claiming that any concept screenshot is a working or release-ready interface.

**ACCEPTANCE**

- Exactly three independent concepts appear once in the ideation batch.
- Each concept supports the same approved product journey and privacy/accessibility contract.
- The concepts differ materially in hierarchy, layout, interaction framing, typography, color, and motion character.
- Every required Gate 1 surface and behavior is shown or specified.
- Language identity uses names and autonyms, never flags; support quality is never conveyed by color alone.
- The selected direction can be converted into one compact design contract without borrowing from another direction.

**VERIFICATION**

- Inspect each generated concept at its native 1440 × 1024 frame for hierarchy, spacing, text legibility, control clarity, clipping, and accidental feature invention.
- Check the written crosswalk against every Gate 1 requirement.
- Calculate contrast for the specified core text, action, and focus pairs.
- Confirm that the repository still has no package manifest, production source, dependency directory, or deployment file.

**STOP CONDITIONS**

- A generated concept is missing, duplicated, visibly clipped, or fails to express its named direction.
- A required behavior cannot be specified without changing the approved product, architecture, privacy posture, or prompt-surface scope.
- Work would cross into implementation or blend directions before the user's selection.

**HANDOFF**  
The three generated images are numbered by their display order in the current conversation. The user selects one number or requests a refinement. Only the selected direction becomes the source for a compact design contract and later implementation.

## Generated concept ledger

Image generation was targeted at 1440 × 1024. The generator returned 1487 × 1058 PNGs with the same 1.406:1 desktop aspect; the native bytes are retained without resampling. These are selection evidence, not production assets.

| Display order | Direction | Native artifact | SHA-256 |
|---:|---|---|---|
| 1 | Warm Garden | `call_mIC2ZdzKeRNkPQ2NuhQNDcRl.png` | `8220BE5C6ABA3D551545F2A24E9A62EEC916B6722F454DBF33A4683FC1CD65E8` |
| 2 | Woven Conversation | `call_OtXkWpOXcd0MRy3nkREnZlDY.png` | `012423F5903421F34E97B2353FDD4DC4A4E63CEEC7EC5FCC19057DC14FA5E2D1` |
| 3 | Resonance Atlas | `call_m0yxASrjly79KUXjHJT2NkMi.png` | `492EBB77AD09B0E92E7A3F3829A2CBC93FBE1E50390325ED2D5F7AC9BC725470` |

The native concept bytes were retained as local selection evidence during
ideation; machine-specific generation paths are intentionally not part of the
public record. Copy only the selected artifact into the application project
after the design contract is accepted.

## Shared product frame

Every direction presents the same product, not a different feature set:

- Desktop-first responsive web application with a direct path: languages → tool → optional context → behavior summary → generate.
- Default pair `English` → `日本語`; default tool Written Translator.
- One reviewed English generated-prompt surface, visibly independent from interface/home/target language.
- Advanced controls are collapsed until requested. The primary path never asks for source text, private relationship details, an account, API key, or permission.
- Generated prompts remain readable and editable. Copy and plain-text download are primary review actions.
- A persistent privacy note says the builder compiles locally and does not send prompt contents to PhraseGarden servers.
- English↔Japanese support may visually show the exact tier supplied by verified pack data. Until evidence exists, concept copy uses `Flagship` with `candidate—not release evidence`; Generic always says it contains no pair-specific guidance.
- Interface status, support tier, warning, and focus never rely on color alone. No flags, emoji, streaks, points, scarcity, leaderboards, or decorative fake controls appear.

## Warm Garden

### Design thesis

A calm editorial workspace where choices feel cultivated rather than configured. Warmth comes from generous negative space, quiet botanical geometry, tactile surfaces, and humane language—not literal game mechanics or growth scoring.

### Primary Builder frame

- A restrained top bar holds the PhraseGarden wordmark, `Your recipes`, interface-language control, and `Works locally` privacy status.
- The page title, “What should your prompt help you do?”, leads directly into an open two-column canvas.
- The left two-thirds contains three numbered semantic groups without enclosing every group in a card: Languages, Tool, and Optional context.
- The right third is a sticky “How it will behave” summary on a soft leaf-tinted surface, followed by one strong `Generate prompt` action.
- `English` and `日本語` are full textual controls connected by a native swap button. Written Translator is selected; Live Voice Coach remains a secondary choice.
- Relationship and register use plain selects. `Advanced settings` is one collapsed disclosure row.

### Surface system

| Surface | Specification |
|---|---|
| Homepage | Editorial welcome with the two language selectors and tool choice in the hero; a single `Start with Written Translator` action; privacy and portability appear as short proof statements below, not feature cards. |
| Builder | Open two-column composition described above; summary updates in place but is announced politely only after a settled change. |
| Prompt Review | Full-width readable “paper” column, approximately 68 characters wide, with Copy and Download above it; behavior summary and warnings precede the prompt; provenance is a compact disclosure below. Editing changes the heading to `Your edited copy`. |
| Local Recipe Library | A calm chronological list with recipe name, language autonyms, tool, version, and modified date in aligned columns; search and Import are supporting actions; Clear local data is visually separated as a destructive action. |
| Mobile | One column in task order. The summary becomes a normal section before the primary action; no sticky panel. A bottom action bar appears only when it does not obscure zoomed content or the software keyboard. |
| Desktop | Maximum content width 1240 px; 12-column grid; builder uses 8/4 columns; prompt review uses a centered reading column with a narrow metadata rail. |

### Typography and language

- Candidate locally bundled families: `Newsreader` for short Latin display text and `BIZ UDPGothic` for UI, body, numerals, and Japanese. No runtime font request.
- UI body 16 px/1.6; Japanese body 17 px/1.75; prompt text 16 px/1.7; headings use restrained optical sizes rather than oversized marketing type.
- Japanese is never italicized or letter-spaced. CJK line breaking is natural, mixed-language runs use correct `lang`, and user text is isolated bidirectionally.

### Color, focus, and tier

- Canvas `#FCF8ED`, ink `#19352D` (12.46:1), primary leaf `#286246` with white (7.18:1), clay accent `#A83C24` on canvas (5.93:1), muted text `#5F6F67` on canvas (5.00:1).
- Keyboard focus is a 3 px `#0759C7` outline with 3 px offset (6.07:1 against canvas). Hover never replaces focus; errors add text and an inline summary.
- Tier appears as a two-line status strip: exact tier label, then evidence/review status or Generic limitation. Shape and text distinguish states; color is supplemental.

### Motion character

Optional 120–160 ms opacity and vertical-position transitions make summary changes feel gently placed. Under reduced motion, position changes and botanical ambient movement are removed; content updates instantly with no loss of state.

### Trade-off

Most welcoming and readable for first-time visitors; its softness requires disciplined boundaries so warnings and technical provenance remain crisp rather than quaint.

## Woven Conversation

### Design thesis

An expressive bilateral workspace where source intent and destination effect remain visibly connected. Two persistent language rails “weave” settings into one behavior summary without suggesting that PhraseGarden sees the user's private source text.

### Primary Builder frame

- A compact top bar is followed by a horizontal pair header: `English` on an indigo rail and `日本語` on a coral rail, joined by a labeled Swap control.
- The main canvas has two synchronized columns. The left rail owns “What you bring” settings such as relationship and source register; the right owns “How it should land” settings such as target register and teaching depth.
- A central connective rule—not a decorative diagram—terminates in a wide bottom summary: “Your prompt will preserve…” with the exact selected safeguards.
- Tool selection is a segmented native-control treatment above the columns. The primary `Generate portable prompt` action sits after the summary.
- Settings that apply across both languages span the full width. Advanced controls expand inline rather than opening a modal.

### Surface system

| Surface | Specification |
|---|---|
| Homepage | The language rails are the hero interaction. Selecting two languages reveals a single sentence about the available support tier and then the tool choice. The primary action advances into Builder without a separate marketing detour. |
| Builder | Paired columns make relationship between input intent and destination behavior explicit; each control belongs to one rail or the shared center, avoiding arbitrary symmetry. |
| Prompt Review | Behavior summary appears as paired “Preserves” and “Adapts only when asked” lists above one English prompt reading surface. Copy and Download are adjacent; warnings bridge both rails and cannot be dismissed without remaining available. |
| Local Recipe Library | A dense but calm grouped list uses two thin language rails at the row edge, textual autonyms, recipe, tier, and version. It never uses flag icons. |
| Mobile | Rails become persistent textual overlines on stacked sections: `HOME · English`, `TARGET · 日本語`, then `SHARED`. Reading order remains linear and meaningful without the visual weave. |
| Desktop | Maximum width 1280 px; paired 5/5 columns around a 2-column connective gutter; summary spans columns 3–10 so it reads as the synthesis rather than a third settings panel. |

### Typography and language

- Candidate locally bundled families: `IBM Plex Sans` for Latin UI and `Noto Sans JP` for Japanese and mixed Japanese runs. No runtime font request.
- UI body 16 px/1.55; Japanese 16 px/1.75; prompt 16 px/1.7. Labels use sentence case; rail labels use restrained uppercase only for short English metadata.
- Japanese labels never inherit uppercase, italics, or tracking. Mixed runs retain natural glyph metrics and explicit language spans.

### Color, focus, and tier

- Canvas `#F7F3EA`, ink `#1B2340` (13.93:1), indigo `#3B4694` with white (8.43:1), coral `#A94145` on canvas (5.37:1), teal `#0B6664` on canvas (6.12:1).
- Keyboard focus is a 3 px `#6B31C8` outline with 3 px offset (6.54:1 against canvas). The two rails never encode selection without a checked state and text.
- Tier appears at the join between rails: exact tier on the first line, evidence date/status and limitation on the second. Generic removes the join motif and says `No pair-specific guidance`.

### Motion character

At full motion, a 140 ms rule transition connects a changed setting to its summary sentence; it never loops. Reduced motion keeps the same connection as a static border and changes text immediately.

### Trade-off

Best at explaining PhraseGarden's central promise—intent carried across a relationship—but must avoid forcing settings into artificial source/target symmetry.

## Resonance Atlas

### Design thesis

A precise, night-mode-first instrument for mapping meaning, social force, and modality before exporting a prompt. It feels exploratory and technically trustworthy without becoming an analytics dashboard or claiming to measure language quality.

### Primary Builder frame

- A deep navy canvas supports a bright, high-contrast top line with wordmark, local privacy status, recipe library, and interface language.
- A compact “route” header reads `English → 日本語 · Written Translator · Flagship`, with every element textual.
- The Builder is a sequence of four wide horizontal bands: Meaning, Relationship, Register, and Delivery. Each band exposes only its default control and one `Adjust` disclosure.
- A right-side “Behavior signal” panel restates selected consequences in plain language. Static contour lines organize the panel but never visualize a score, confidence, or model output.
- The primary `Compile prompt` action follows the final band; provenance preview and limitations are quiet supporting links.

### Surface system

| Surface | Specification |
|---|---|
| Homepage | A strong one-sentence thesis and compact route composer dominate: choose home, target, then tool. A static atlas field provides atmosphere; privacy, portability, and tier honesty are one concise line each. |
| Builder | Horizontal semantic bands make precedence visible without exposing compiler internals. The Behavior signal panel translates configuration into human consequences. |
| Prompt Review | The English prompt occupies a light reading surface against the dark shell; summary and warnings remain dark high-contrast panels. Copy and Download are primary peers. Provenance opens as a textual route manifest, never a code-only dump. |
| Local Recipe Library | An atlas index: one semantic table with name, route, recipe, tier, version, and modified time. Filters are absent until the list volume proves a need; Search, Import, and Export remain. |
| Mobile | The route becomes a compact heading; semantic bands stack as numbered waypoints. The Behavior signal moves immediately before Compile. Decorative contour lines disappear below 600 px. |
| Desktop | Fluid shell capped at 1360 px; builder uses 9/3 columns; bands align to a common label/control grid; reading view caps prompt text at 70 characters. |

### Typography and language

- Candidate locally bundled families: `Space Grotesk` for Latin display/UI and `Noto Sans JP` for Japanese and mixed Japanese runs. No runtime font request.
- UI body 16 px/1.55; Japanese 16 px/1.75; prompt 16 px/1.7. Technical metadata may use tabular numerals but never forces prompt text into monospace.
- Japanese gets natural breaks, no tracking/italics, explicit language spans, and enough vertical space for ruby where later content contracts allow it.

### Color, focus, and tier

- Canvas `#0B1632`, primary text `#F6F8FF` (16.84:1), secondary text `#B9C5DF` (10.31:1), cyan `#5AD9CF` (10.43:1), gold `#F2C453` (10.89:1).
- Keyboard focus is a 3 px gold outline with 4 px offset. Filled cyan actions use navy text (10.43:1). Focus, selected, warning, and error states have distinct shapes and explicit text.
- Tier is part of the textual route manifest, followed by review status/date or Generic limitation. Gold can call attention to review status but never carries the meaning alone.

### Motion character

At full motion, a selected band may emit one 180 ms outward opacity ripple contained within that band. It never loops or implies measurement. Reduced motion replaces it with a static 2 px emphasis rule and instant summary updates.

### Trade-off

Most distinctive and strongest for provenance-heavy review; its dark instrument character needs careful warmth in copy and spacing so first-time visitors do not mistake the studio for an expert-only tool.

## Requirement crosswalk

| Gate 1 requirement | Warm Garden | Woven Conversation | Resonance Atlas |
|---|---|---|---|
| Homepage | specified | specified | specified |
| Builder | specified and primary image target | specified and primary image target | specified and primary image target |
| Generated-prompt Review | specified | specified | specified |
| Local Recipe Library | specified | specified | specified |
| Mobile and desktop | specified | specified | specified |
| Typography | two-family local candidate | two-family local candidate | two-family local candidate |
| Color and contrast | ratios recorded | ratios recorded | ratios recorded |
| Focus states | explicit 3 px treatment | explicit 3 px treatment | explicit 3 px treatment |
| Support tier | text plus evidence/limitation | text plus evidence/limitation | textual route manifest |
| English and Japanese | autonyms, `lang`, CJK rules | persistent language rails | route plus CJK rules |
| Reduced motion | instant/static substitute | static connection | static emphasis rule |

## Selection rule

Woven Conversation is selected as a whole. No blend or refinement was requested. Warm Garden and Resonance Atlas remain decision history only and contribute no components, palette, typography, or motion to the selected design contract.
