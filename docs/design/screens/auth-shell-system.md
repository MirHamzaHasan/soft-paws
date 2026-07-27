# BarkLog Auth Shell System

## Purpose

This document defines the reusable structural system for BarkLog authentication screens so they feel symmetrical, related, and calm.

Use this shell for:

- A1 Welcome
- A2 Sign Up
- A3 Sign In
- A4 Forgot Password

## The Structural Idea

Auth screens in BarkLog should feel centered overall but not mechanically centered line by line.

The correct balance is:

- top navigation anchored left
- hero block centered
- form column full-width and left-aligned inside a centered container
- bottom alternate-action copy centered

This creates symmetry through macro layout, not through making every element share the same alignment.

## Canonical Auth Layout

### Zone 1: Top Navigation

- paper background
- single back button on the left
- generous breathing room
- no title in the nav bar

Rules:

- keep the back affordance visually quiet
- align it to the same horizontal padding as the form column
- never crowd the hero block by adding nav clutter

### Zone 2: Hero Block

- centered title
- centered supporting copy
- large vertical gap above and below

Rules:

- this zone establishes calm and trust
- keep copy short
- use display-level emphasis for the title
- subtitle stays muted and single-purpose

### Zone 3: Form Column

- same width as the primary CTA
- labels align left
- fields align left
- supporting links sit on the same column edge unless intentionally right-justified

Rules:

- the form is the strictest and most structured part of the screen
- use a single column only
- do not split the form into decorative sections

### Zone 4: Bottom Alternate Action

- centered line of text
- one emphasized link
- enough separation from the CTA to avoid feeling jammed

Rules:

- use this same pattern for sign in, sign up, and reset-adjacent screens
- keep the sentence short and neutral

## Symmetry Rules

### 1. One Center Column

Every auth screen should be built on one centered content column with consistent horizontal margins.

Recommended mobile behavior:

- screen padding: `24px`
- content width: full width within the padding
- max width on larger canvases: roughly phone-comfort width, not stretched tablet width

### 2. Shared Vertical Rhythm

Use a repeatable vertical scale between zones:

- top nav to hero: large gap
- title to subtitle: small gap
- hero to form: large gap
- label to field: tight gap
- field to field: medium-large gap
- form to CTA: large gap
- CTA to bottom alternate action: medium-large gap

The screen should feel vertically intentional, not packed.

### 3. Mixed Alignment With Discipline

This shell is not fully centered and not fully left-aligned.

Use:

- centered for hero and bottom assistive text
- left-aligned for labels and input content
- right-aligned for optional supporting actions like `Forgot password?`

This pattern should stay stable across all auth screens.

### 4. Shared Control Dimensions

Across auth screens, keep these consistent:

- input field height
- button height
- input radius
- button radius
- label style
- link style

Consistency here is what will make the app feel symmetrical over time.

## Field Styling Direction

Use the screenshot as the primary visual reference for auth inputs.

Recommended interpretation:

- quiet surface fill or paper-white field
- subtle border or hairline structure
- no shadows
- enough inner padding that text does not crowd the edges
- trailing visibility icon aligned to the same inner padding rhythm

Do not over-stylize auth inputs differently from the rest of the system.

## Auth Copy Rules

- titles should feel reassuring, not salesy
- subtitles should explain only the immediate task
- action labels should be plain and direct
- links should read like utilities, not marketing

## What Makes This Shell Feel BarkLog

- wide breathing room
- quiet paper background
- strong black title
- disciplined labels
- understated controls
- one high-confidence CTA

## Do Not Do

- do not add illustrations or dog photos to auth
- do not center-align labels or input text
- do not add extra helper text below every field
- do not use decorative separators or cards
- do not make sign-in visually louder than the rest of the app
