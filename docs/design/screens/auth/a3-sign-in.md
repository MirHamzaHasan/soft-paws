# A3 Sign In

## Purpose

This screen confirms that BarkLog is calm, modern, and trustworthy before the user reaches the core app.

Its job is not to excite. Its job is to reduce friction and restore context.

## Source Reference

Primary reference:

- `/Users/mirhamzahasan/Downloads/stitch_bark_log/sign_in_a3/screen.png`

Supporting reference:

- `/Users/mirhamzahasan/Downloads/stitch_bark_log/sign_in_a3/code.html`

When the PNG and HTML differ, prioritize the screenshot as the visual truth.

## Screen Role In The System

A3 should become the reference auth screen for:

- spacing rhythm
- title/subtitle treatment
- input proportions
- CTA prominence
- centered-vs-left alignment balance

The rest of the auth family should inherit from this screen rather than redesigning the shell each time.

## Layout Breakdown

### 1. Top Nav

- simple back arrow at top-left
- no title in the nav bar
- wide paper margin around the icon

The back arrow should feel lightweight and precise, not like a filled button.

### 2. Hero Block

- headline: `Welcome back`
- centered
- visually dominant but not oversized
- subtitle directly below in muted text

This block should sit in a generous upper-middle zone, not cramped near the top.

### 3. Form Block

The form block is one clean column:

- email label
- email field
- password label
- password field with trailing visibility toggle
- forgot password utility link

The form content should feel evenly stacked and structurally quiet.

### 4. CTA Block

- one black primary button
- full column width
- strong visual anchor

This is the heaviest element on the screen and should clearly out-rank everything except the title.

### 5. Bottom Alternate Action

- centered sentence
- neutral supporting text
- stronger `Sign up` link

This should feel like a polite secondary route, not a competing CTA.

## Visual Spec

### Background

- Paper
- no section cards
- no shadows
- no illustration

### Title

- use BarkLog auth display treatment
- strong black
- medium weight only
- keep copy on one line where possible

### Subtitle

- muted
- direct and plain
- one sentence only

### Labels

- uppercase
- small
- medium weight
- letter-spaced
- muted but still legible

### Inputs

- identical width
- identical height
- identical radius treatment
- same internal horizontal padding
- same baseline for text content

For password:

- visibility toggle sits inside the field
- align the icon optically with placeholder and input text

### Utility Link

- right-aligned under the password field
- clearly secondary to the main CTA
- not too faint

### Primary Button

- full width
- black fill
- white label
- soft but confident radius
- should feel heavier than the inputs

### Footer Line

- centered
- quiet supporting copy
- stronger linked action on the final words

## Symmetry Rules For This Screen

### Macro Symmetry

The screen should feel balanced from top to bottom through centered massing:

- nav icon occupies a light header band
- hero block sits centered in the upper half
- form and button create a stable center column
- bottom alternate action closes the composition cleanly

### Micro Symmetry

Within the form column:

- all field edges line up
- all labels share the same left edge
- both fields use the same inner padding
- CTA edges match field edges

This is what creates the sense of polish the rest of the app should inherit.

## Interaction Notes

- back arrow: quiet opacity response
- field focus: stronger border or clearer active state, still minimal
- password visibility: utility only, no animation flourish
- sign-in button: subtle press scale or opacity only

## Accessibility Notes

- maintain strong contrast between title and background
- labels must remain legible at small size
- tap target for back and visibility controls must still hit `44x44`
- do not rely on placeholder text as the only field descriptor

## Reuse Rules For Other Auth Screens

When adapting this screen:

- keep the same shell
- keep the same form width
- keep the same CTA width and prominence
- only change title, subtitle, field count, and secondary links

### A2 Sign Up

- same shell
- longer form
- same headline zone

### A4 Forgot Password

- same shell
- single-field form
- same CTA sizing

### A1 Welcome

- same paper background and top spacing discipline
- different center composition because of logo and dual CTA setup

## Approval Checklist

Approve this screen only if:

1. the hero block feels centered and calm
2. the form edges and CTA edges align perfectly
3. the button feels clearly primary without being loud
4. the screen looks like part of a bigger, disciplined system
5. future auth screens can reuse this shell with minimal change
