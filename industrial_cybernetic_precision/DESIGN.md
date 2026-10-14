---
name: Industrial Cybernetic Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcac6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#859490'
  outline-variant: '#3c4947'
  surface-tint: '#4fdbc8'
  primary: '#4fdbc8'
  on-primary: '#003731'
  primary-container: '#14b8a6'
  on-primary-container: '#00423b'
  inverse-primary: '#006b5f'
  secondary: '#80d5cb'
  on-secondary: '#003733'
  secondary-container: '#007068'
  on-secondary-container: '#9af0e5'
  tertiary: '#7bd8b1'
  on-tertiary: '#003827'
  tertiary-container: '#58b590'
  on-tertiary-container: '#00432f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71f8e4'
  primary-fixed-dim: '#4fdbc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#97f5cc'
  tertiary-fixed-dim: '#7bd8b1'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#00513a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  slate-surface: '#1E293B'
  slate-border: '#334155'
  canvas-light: '#F8FAFC'
  alert-amber: '#F59E0B'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies high-reliability engineering, agronomic intelligence, and industrial automation. It balances rugged field resilience with the computational precision of modern IoT and automation platforms. The aesthetic bridges physical hardware telemetry and digital command interfaces, projecting absolute stability, deterministic logic, and high-density legibility.

### Design Movement: Technical Brutalism Meets Precision SaaS
The visual language merges disciplined minimalism with functional data visualization:
- **Structural Integrity:** Heavy reliance on clear visual structures, subtle architectural borders (1px hairline rules), and calibrated micro-surfaces.
- **Data Density:** High-contrast telemetry badges, monospaced data readouts, and structured spec grids designed for immediate comprehension in operational environments.
- **Ergonomics & Safety:** Explicit state communication using WCAG AA compliant contrast ratios across dark field-monitors and bright outdoor environments.

## Colors

The palette is anchored in an industrial dark theme optimized for sustained monitoring in control rooms and field tablets, reducing glare and eye strain.

- **Primary (`#14B8A6`):** Cyber Teal serves as the primary interactive and status accent. It provides luminous clarity against dark backgrounds without inducing retinal fatigue.
- **Secondary (`#0F766E`):** Deep Technical Emerald anchors structural interactive elements, selected container states, and active navigation nodes.
- **Tertiary (`#047857`):** Agronomic Forest represents biological sensor baselines, positive confirmation states, and environmental balance indicators.
- **Neutral Canvas (`#0F172A`):** Industrial Obsidian forms the base substrate, grounding all operational contexts.
- **Named Colors:**
  - `slate-surface` (`#1E293B`): Elevated card, panel, and telemetry container background.
  - `slate-border` (`#334155`): Calibrated hairline boundary stroke ensuring crisp component separation.
  - `canvas-light` (`#F8FAFC`): Inverted high-contrast text, icons, and specialized daytime data surfaces.
  - `alert-amber` (`#F59E0B`): Thermal thresholds, telemetry warnings, and attention-demanding mechanical anomalies.

## Typography

The typographic hierarchy uses a triad of specialized typefaces:
- **Headings (Space Grotesk):** Provides engineering-grade geometry with subtle technical eccentricities that differentiate the brand from conventional enterprise SaaS.
- **Body & Controls (Inter):** Highly legible, neutral workhorse font optimized for interface clarity, dense form fields, and long-form technical reports.
- **Data, Badges & Telemetry (JetBrains Mono):** Tabular figures, sensor outputs, machine statuses, and hardware IDs are strictly set in JetBrains Mono to enforce strict column alignment and rapid optical parsing.

## Layout & Spacing

The layout is built on an absolute 8-point base grid system, structured around a 12-column responsive layout engine on desktop, an 8-column layout on tablet devices, and a 4-column layout on handheld mobile terminals.

- **Breakpoints:**
  - Mobile: `< 640px` (Margin: `1rem`, Gutter: `1rem`)
  - Tablet: `640px – 1024px` (Margin: `1.5rem`, Gutter: `1.25rem`)
  - Desktop / Control Panel: `> 1024px` (Margin: `2rem`, Gutter: `1.5rem`, max container constraint: `1440px`)
- **Spacing Rhythm:** Standardize internal component padding using `space-xs` and `space-sm` for compact telemetry elements. Major system modules and dashboard cards rely on `space-md` through `space-xl` to maintain rigorous air gaps between unrelated functional blocks.

## Elevation & Depth

To avoid optical muddiness common in industrial UI, elevation is achieved through **tonal layering and crisp hairline outlines** rather than heavy blurred drop shadows.

1. **Base Layer (L0):** `#0F172A` (Screen canvas, workspace background).
2. **Surface Layer (L1):** `#1E293B` bounded by a 1px solid `#334155` border. Used for cards, panels, and data tables.
3. **Elevated Overlays / Modals (L2):** `#1E293B` with a subtle, technical ambient drop: `0px 4px 20px -2px rgba(0, 0, 0, 0.45)`, reinforced by an active highlight border `1px solid rgba(20, 184, 166, 0.3)`.
4. **Interactive Focus / Active Edges:** Rather than fuzzy glow rings, interactive focus is denoted with a razor-sharp 2px border using `#14B8A6`.

## Shapes

The design system uses soft micro-radii (`0.25rem` / `4px`) for foundational components (buttons, input fields, badges) and `rounded-lg` (`0.5rem` / `8px`) for dashboard modules and analytical cards. 

This restrained curvature preserves a disciplined, industrial identity reminiscent of precision-machined hardware chassis and digital instrument clusters, completely avoiding playful or pill-shaped consumer geometry.

## Components

### Buttons
- **Primary Action:** Solid Cyber Teal (`#14B8A6`) background, obsidian text (`#0F172A`), `JetBrains Mono` medium 13px uppercase label, 0.25rem border radius. Hover: subtle brightness lift with zero shadow expansion.
- **Secondary / Outlined:** Transparent surface, 1px `#334155` stroke, `#F8FAFC` label. Hover: border shifts to `#14B8A6`, text shifts to `#14B8A6`.
- **Destructive / Override:** Outlined `#F59E0B` or red with muted inner tint (`rgba(245, 158, 11, 0.1)`).

### Cards & Telemetry Containers
- **Container Structure:** Background `#1E293B`, border 1px solid `#334155`, corner radius 8px (`rounded-lg`).
- **Telemetry Header:** Monospaced label (`label-mono-sm`) anchored on top-left; status indicator diode (green/amber pulse dot) pinned to top-right.

### Technical Data Tables & Specs
- **Header:** Sticky `#0F172A` background, 1px bottom border `#334155`, text set in `label-mono-sm` with 40% opacity white.
- **Rows:** Alternate row striping using transparent and `rgba(255, 255, 255, 0.02)`. 1px horizontal dividers between data points.
- **Numeric Data:** Tabular font alignment, right-aligned values in `JetBrains Mono`.

### Chips & Status Badges
- **Specification:** Height 22px, padding `0.125rem 0.5rem`, corner radius 4px (`rounded-sm`).
- **Operational Normal:** Border 1px solid `rgba(20, 184, 166, 0.3)`, background `rgba(20, 184, 166, 0.1)`, text `#14B8A6`.
- **System Warning:** Border 1px solid `rgba(245, 158, 11, 0.3)`, background `rgba(245, 158, 11, 0.1)`, text `#F59E0B`.

### Form Inputs & Controls
- **Text Inputs:** Background `#0F172A`, 1px border `#334155`, radius 4px, text `#F8FAFC`. Focus: 1px border `#14B8A6` with zero outer ring blur.
- **Checkboxes & Radios:** Angular 16x16px boxes, 1px border `#334155`. Checked state: filled `#14B8A6` with high-contrast obsidian glyph.