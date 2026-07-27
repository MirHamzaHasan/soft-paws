# BarkLog Component Blueprint

## Purpose

This document defines the reusable UI building blocks that should exist before full-screen implementation begins.

## Component Philosophy

Components should be:

- flat
- readable
- stateful
- accessible
- useful across multiple screens

The design system should avoid one-off screen art when a reusable pattern will do.

## Tier 1 Primitives

These should exist first.

### App Frame

- safe area wrapper
- screen padding contract
- optional bottom tab accommodation

### Top Bar

- back arrow or leading control
- title or dog identity
- optional trailing action

### Section Header

- section title
- optional caption
- optional action link

### Button Family

- primary button
- secondary button
- pill button
- icon button
- destructive button

### Input Family

- text input
- numeric input
- textarea
- dropdown or searchable picker
- toggle
- segmented selector

### Feedback Primitives

- toast
- inline banner
- skeleton block
- empty state block
- confirmation modal

## Tier 2 Domain Components

These express BarkLog-specific behavior.

### Event Button

Purpose:

- one-tap routine capture

Requirements:

- event emoji
- event label
- event color triplet
- tap confirmation
- long-press affordance
- minimum `72px` height

### Daily Summary Card

Purpose:

- real-time count summary of today's activity

Requirements:

- concise sentence structure
- auto-refresh after event logging
- support for empty, partial, and rich states

### Timeline Row

Purpose:

- compact event history

Requirements:

- event identifier
- summary detail
- timestamp
- attachment indicator
- swipe actions
- unsynced state support

### Stat Card

Purpose:

- dense weekly insight summaries

Requirements:

- overline label
- strong value
- compact footprint
- optional status color or indicator

### AI Insight Card

Purpose:

- present narrative interpretation, not just metrics

Requirements:

- distinct AI label treatment
- expandable content
- locked and unlocked states
- premium badge support

### Alert Banner

Purpose:

- anomaly detection, warning, or action request

Requirements:

- semantic severity
- dismiss option
- optional next-step action

### Permission Card

Purpose:

- explain value before requesting system permissions

Requirements:

- icon
- one-line value prop
- current state
- action control

### Dog Card

Purpose:

- switching, household overview, or profile summary

Requirements:

- avatar
- name
- contextual metadata
- active or alert state

### First Aid Step Block

Purpose:

- structured emergency instructions

Requirements:

- visible step number
- short imperative copy
- optional caution block
- optional timer or supporting action

### Paywall Offer Card

Purpose:

- present premium plans without clutter or coercion

Requirements:

- annual hero state
- monthly secondary state
- savings messaging
- current trial context

## Tier 3 Specialized Components

These can follow after the core system is stable.

- body map selector
- photo comparison slider
- activity bar chart
- poop quality trend chart
- expense category chart
- emergency clinic card
- AI chat message bubble
- export report preview block

## Required States Across Components

Every reusable component should specify:

- default
- pressed or active
- disabled
- loading if applicable
- empty if applicable
- error if applicable
- dark mode behavior if applicable

## Accessibility Requirements For Components

- every tappable element must meet minimum target size
- every icon-only control must have an accessible label
- event type must be recognizable without color
- motion-heavy components need reduced-motion fallback

## Pre-Build Deliverable

Before development starts, the design team should deliver:

- component inventory in Figma
- state variants for each tier 1 and tier 2 component
- light and dark mode examples for shared components
- accessibility annotations for non-obvious controls
