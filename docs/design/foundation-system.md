# BarkLog Foundation System

## Purpose

This document turns the design specification into a working foundation for design and implementation.

## Visual Character

- background-first layout
- high-contrast text
- minimal component chrome
- flat surfaces
- thin borders
- generous whitespace
- restrained corner radius

## Core Palette

### Neutral System

- Ink: `#0A0A0A`
- Paper: `#FAFAFA`
- Surface: `#F5F5F4`
- Border: `#E7E5E4`
- Muted: `#737373`
- Faint: `#A3A3A3`

## Event Palette

Use event triplets only where the color creates recognition or category memory.

- Poop: `#FDF3EC` / `#EDDCCE` / `#6B3418`
- Pee: `#EEF4FB` / `#D7E4F2` / `#1E3A5F`
- Meal: `#F0F5E8` / `#DCE6C8` / `#2F4017`
- Walk: `#FBF1DD` / `#EEDCB4` / `#5C3F0F`
- Medication: `#F3F0FB` / `#E2DCEF` / `#362B68`
- Symptom: `#FCEBEB` / `#F7C1C1` / `#791F1F`
- Grooming: `#E1F5EE` / `#9FE1CB` / `#085041`
- Weight: `#F1EFE8` / `#D3D1C7` / `#444441`

## Semantic Colors

- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Info / AI: `#534AB7`

## Typography

### Font

- Inter only
- Weight `400` and `500` only

### Type Scale

- Display: `28 / 500`
- Title: `18 / 500`
- Body: `14 / 400`
- Body Emphasis: `14 / 500`
- Caption: `12 / 500`
- Overline: `11 / 500` with tracking
- Stat Number: `24 / 500`

### Typography Rules

- no 600 or 700 in product UI
- no gray text for primary content
- use muted and faint only for secondary and tertiary information
- do not use decorative display typography

## Spacing

- xs: `4`
- sm: `8`
- md: `12`
- lg: `16`
- xl: `20`
- 2xl: `24`
- 3xl: `32`

### Spacing Rules

- cards should default to `20px` internal padding
- stacked content should generally use `12px` or `16px` vertical rhythm
- major sections should separate with `24px`

## Radii

- sm: `4`
- md: `8`
- lg: `12`
- xl: `14`
- pill: `999`

### Radius Rules

- cards: `12`
- primary action buttons: `12` to `14`
- event buttons: `14`
- pills and avatars: `999`

## Border Rules

- default border width: `0.5px`
- borders should do structural work
- do not add shadows unless a specific platform or accessibility need forces it

## Motion

Motion should do one of three things:

- confirm an action
- guide attention
- add lightweight delight

### Motion Rules

- event button tap: scale feedback then return
- toast: slide up, pause, fade down
- modals and sheets: rise from bottom
- tab transitions: simple crossfade
- AI loading: pulse or shimmer only
- respect Reduce Motion with fades instead of spring or scale transitions

## Dark Mode

Dark mode is a separate palette, not inversion.

### Core Rules

- Ink becomes light text
- Paper becomes dark background
- Surface and border values rebalance independently
- event colors darken into muted tiles instead of reversing
- photos remain unmodified
- Emergency SOS always stays in light mode
- primary button and text invert fully

## Accessibility

### Non-Negotiables

- WCAG AA contrast
- minimum `44x44` tap targets
- Dynamic Type up to `200%`
- clear screen reader labels
- color is never the only signal
- modal focus trap support

### Accessibility Consequences

- event buttons need label, emoji, and accessible action text
- charts need both color and shape or label differentiation
- fixed-height text containers should be avoided

## Design System Implementation Notes

Before implementation starts, the design team should define:

- the exact neutral and event tokens in Figma
- the light and dark theme pairings
- responsive behavior for small and large phones
- accessible text overflow rules for large Dynamic Type settings
