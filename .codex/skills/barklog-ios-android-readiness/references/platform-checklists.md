# BarkLog Platform Checklists

## Common Native Surfaces

- camera or photos for toxicity scanning
- notifications for medication, walk, meal, or care reminders
- location for nearest emergency clinics
- Apple Health and Google Fit for activity
- deep links from reminders, exports, or shared household flows

## Required Questions

- what permission is required
- when is the permission asked
- what happens if the user says no
- what still works offline
- what needs platform-specific copy
- what needs Info.plist, Android manifest, plugin, or store metadata changes

## Release Notes Checklist

- changed env vars
- changed Expo plugins
- changed native capabilities
- changed onboarding or permission copy
- changed QA coverage

## BarkLog Red Flags

- emergency features that require network before showing first guidance
- premium gates inserted before urgent information
- vague permission prompts without a clear caregiving reason
- integrations that silently turn on health data collection
