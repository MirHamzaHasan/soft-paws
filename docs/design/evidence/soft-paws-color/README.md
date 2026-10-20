# Soft Paws colour refinement · 20 October 2026

Owner request: check Mobbin again and make the cat app more joyful and colourful.
This updates colour roles while preserving the approved composition and cat.

The new palette uses warm cream, an apricot welcome, teal actions, butter meals,
lilac litter, mint play, rose notes/mood, sky water and periwinkle sleep. Dark
mode uses deeper coloured panels and lighter matching inks. Named controls keep
their labels/icons; selected states still have checks or navigation semantics.

## Research

Actual Mobbin MCP searches were repeated. The inspected sources include
[Finch's onboarding](https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa),
[Finch's companion profile](https://mobbin.com/screens/b63e72e3-54bd-4a16-9950-0f3b496fc7d4)
and [BitePal's logging prompt](https://mobbin.com/screens/eb74890f-44ab-41bd-8933-7beebe1036c3).
The structural lesson is a visible companion beside clear daily actions.
Soft Paws uses its own artwork, layout and colour values. Other apps' images
are not bundled or reproduced.

## Board evidence

- [Light](light.jpg) and [dark](dark.jpg) samples: Home, Care, chooser and kit.
  All 94 light and 94 dark rests were inspected in contact sheets.
- [Contrast](contrast.json): 82 pairs pass. Reading pairs are at least 4.5:1;
  tested standalone category icons and input boundaries are at least 3:1.
- [Layout](layout-qa.json): 94 surfaces × light/dark/130% text = 282 checks,
  no errors, overflow or undersized controls detected.
- [Compact check](compact-qa.json): six surfaces at 375 × 667 across the same
  three modes = 18 checks, no issues.
- [Browser journeys](journeys.json): all 15 checks pass, including Rive loading,
  transparent interaction, bounded reactions and offscreen pause.

## Shared native source

`design/soft-paws/css/tokens.css` and `js/color-roles.js` generate the Compose
palette and category mappings via `tools/soft_paws_tokens.py`. Home uses coloured
quick actions, the apricot cat card and a lilac question card. Care, Memories,
row icons and existing event components consume those same roles.
The launcher icon now uses the owned cat's face on apricot, including adaptive
and monochrome Android variants and an opaque 1024 × 1024 iOS asset. Its editable
source is `design/soft-paws/assets/brand/app-icon.svg`.

## Native verification

[Native Home samples](native-home.jpg) show the actual Android/iOS light and
dark palettes. Original full-frame PNGs are included here. These compare colour;
they do not assert complete layout parity with the board.

[Native Rive frames](native-rive.jpg) show each platform at approximately 200,
900 and 1800 ms after tapping the cat. The cat visibly tilts and raises a paw;
the surrounding card stays unchanged. They are captures from official native
runtimes, not exported animation/video replicas.

The Android offline save/reopen baseline passed, followed by the complete
five-tab/save/relaunch/dark/tap journey with stable Activity launch waits.
Android Debug/Release, lint, migration verification and all 152 JVM tests pass.
The iOS core suite passes both tests; a further explicit-tap accessibility run
also passes. [Structured native scope](native-checks.json) records these checks.
Both final iOS Debug/Release simulator hosts and their bundle checks pass.

A freshly installed instrumented Android Debug APK hit an ART DEX-verification
startup timeout under concurrent build load, before application startup. The
final passing emulator run followed Android's normal package compilation.
This does not establish cold-start performance on a physical device.

The reported iOS crash was in Compose's accessibility element disposal. The
iOS graph uses the official 1.12.2 renderer containing the
[published fix](https://github.com/JetBrains/compose-multiplatform-core/pull/3403).
Android keeps its existing compatible baseline. Accessibility remains enabled;
the crash did not recur in the save/relaunch/repeated-navigation tests.

Full 89-screen native parity, physical/assistive checks, minimum-OS devices and
service/store configuration remain separate gates in task002.
