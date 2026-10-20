# BarkLog Premium — useful paid outputs and photo highlights

**20 October 2026 · task046 superseding direction (local implementation verified):**
Additional dog creation and AI Safety explanations are Premium. Approved USD plans:
$2.99/week, $6.99/month, $39.99/year. Native RevenueCat integration is authorized;
the owner will supply configuration later. Existing dogs/journals and emergency
calls stay available. Nearby-vet Maps handoff is Premium; guided training is Coming
soon. See [current contract](premium-revenuecat-and-safety.md) and
[task046](../../tasks/task046-premium-safety-and-nearby-vets.md). Older billing and
undecided-price statements below are historical for this scope. Release AI gates,
no journal sync and all local data-preservation rules remain in force.


Owner direction: 17 October 2026. Prices remain undecided. Real billing, Firebase
identity and Atlas are still separate integration work. This plan does not enable them.

## The free / Premium boundary

| Feature | Free | Premium | Delivery position |
| --- | --- | --- | --- |
| Daily care, dogs, notes and timeline | Create/read/edit/delete and local history | No basic logging limit | Existing native implementation |
| Reminders, safety and factual charts | Existing tools remain available | No emergency/safety gate | Existing native implementation |
| Care reports | Read the selected report on mobile; raw CSV export | PDF export, print and native PDF sharing | Native demo-plan gate in task033; real entitlement pending |
| Memory Book | Save/read photos, captions and collections | Designed PDF export and sharing | Native demo-plan gate in task033; real entitlement pending |
| Ask about {dog} | Visible contextual Home entry and clear explanation | Conversation, generated recaps and vet-question drafts | Entry restored; replies remain labelled demo |
| Photo highlights | Choose/review photos and preview the film | Render/save/share MP4 in portrait or square | Native implementation and simulator verification in task034; physical QA pending |
| Rich report layouts | Existing factual mobile report | Optional future photo layouts/comparison pages | Candidate after the core output flow; not implemented |

Do not gate reading existing memories or records, delete history on downgrade,
invent care facts, interrupt a log with an upgrade, or offer medical assessment as
Premium. Show the paid output and its purpose at the moment someone requests it.
Avoid repeated popups. A saved PDF outside the app remains the user's file.

The owner explicitly changed the older “all PDF exports free” policy. Historical
task/board evidence retains its original scope; this is the current boundary.
CSV stays available as a raw-record copy, including before local deletion.

## First video feature: a small film from selected photos

Implemented first version: 3–12 selected photos, editable order and captions up
to 100 characters, 9:16 portrait or 1:1 square, gentle pan/zoom and H.264 MP4 export.
Each photo lasts 2.8 seconds; transitions use simple cuts. The film is silent. Music is
a later choice after selecting original/licensed audio; no streaming-service catalog.

Use the person's actual selected dog/photos/dates. No generated health story or
automatic whole-library scan. Work on-device; no Atlas/Firebase upload is needed
to assemble a photo film. The native photo journal already supplies private files.

The owner approved this flow on 17 October 2026. The [live review](http://localhost:4278/premium/index.html#play-next-highlight-editor)
is a storyboard/editor proposal with local image selection and play/pause, not a
video encoder. No downloadable MP4 exists from that board. Task034 implements the approved editor natively. Other new directions still require review.

## Framework recommendation, checked 17 October 2026

**Use a shared KMP edit model/controller and platform-native export adapters.**
This is a recommendation from the APIs below, not a completed device benchmark.

| Option | What the primary source establishes | Decision for BarkLog |
| --- | --- | --- |
| Android Media3 Transformer | Image duration/frame-rate input; compositions combine images/video/audio; asynchronous export, progress and cancel | Recommended Android encoder behind the shared boundary |
| Apple AVFoundation | AVAssetWriter writes audiovisual files; pixel-buffer input supports rendered image frames | Recommended iOS encoder, with drawing/crop/zoom frames through native image APIs |
| KEditor | KMP Android/iOS API backed by FFmpeg; repository identifies GPL-2.0 | Evaluated alternative, not selected; do not add without a dependency/license/distribution review and device proof |
| FFmpegKit | Original repository is retired and points to a source-only continuation | Do not adopt the retired package for this small first feature |

Media3 is open source. AVFoundation is Apple's platform framework, not an
open-source KMP library. This design avoids a commercial editor SDK or per-export
service. The native implementation and simulator checks are complete; physical QA remains.
Task034 adds Android Media3 Transformer/effect 1.11.1 (Apache-2.0) and the system AVFoundation adapter. No commercial editor or FFmpeg dependency is used.

Primary sources:

- [Media3 image input](https://developer.android.com/media/media3/transformer/transformations): still images become clips with explicit duration/frame rate.
- [Media3 compositions](https://developer.android.com/media/media3/transformer/composition): multi-asset arrangement; documented crossfade limitations.
- [Media3 export/progress/cancel](https://developer.android.com/media/media3/transformer/getting-started): asynchronous export and limited codec resources.
- [Media3 license](https://github.com/androidx/media/blob/release/LICENSE).
- [AVAssetWriter](https://developer.apple.com/documentation/avfoundation/avassetwriter) and [pixel-buffer adaptor](https://developer.apple.com/documentation/avfoundation/avassetwriterinputpixelbufferadaptor). Select APIs compatible with the supported iOS floor; newer receiver APIs do not automatically support older OS versions.
- [KEditor source/README/license](https://github.com/nesyou01/KEditor).
- [FFmpegKit retirement/continuation](https://github.com/arthenica/ffmpeg-kit).

## Native implementation and release checks

Task034 implements the shared draft/controller and native renderers below. Simulator
checks cover actual frames, cancellation, cleanup and native sharing; physical
receiving-app playback, memory, battery and supported-OS proof remain release gates.

1. Platform-free `HighlightDraft`/clips store dog ID, private photo IDs, order,
   caption, output aspect and revision, with fixed duration and centered crop. Persist through
   the existing SQLite draft repository with explicit photo references, not UI preferences or photo uploads.
2. Wire `HighlightRenderer` through AppContainer. Android uses Media3; iOS uses
   AVFoundation. Shared Compose owns editing, Premium access and progress state.
3. Decode bounded images, respect orientation and crop consistently; render one
   frame at a time on iOS. Avoid holding an entire film's frames in memory.
4. Start with H.264 MP4, SDR, 720p portrait/square and a bounded duration/photo
   count; evaluate 1080p only after real-device resource tests. Verify actual
   compatibility instead of promising hardware encoding on every device.
5. Check access before rendering/sharing. Current demo-plan UI must later be
   replaced by verified store entitlements; demo mode cannot establish payment.
6. Show real progress, cancellation and file preparation. Share only a complete,
   playable output; never synthesize success or a progress percentage from a timer.
7. Cover no photos, missing files, picker denial/cancel, corrupt/oversized images,
   low storage, codec errors, background interruption, dog switch and repeated taps.
   Cancel/dispose closes encoder sessions and removes partial output; preserve drafts.
8. Test file duration, frame dimensions, order, rotation, colors, captions and actual
   receiving-app playback on physical Android/iPhone. Measure time/memory/battery
   and Release size. Video export does not run during Home/startup.

## Order before finalization

The Ask entry/PDF boundaries and approved native photo-to-MP4 slice are implemented.

1. Replace demo identity, responses and entitlements only when the corresponding
   real-service work is configured and tested; choose prices separately.
2. Complete the [completion checklist](../release/finalization-checklist.md) and
   physical/store gates. A stronger Premium offer is not proof of conversions.
