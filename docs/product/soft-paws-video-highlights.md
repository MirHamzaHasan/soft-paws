# Soft Paws · local cat photo films

The approved cat editor and separate preview use the generated Soft Paws kit.
The editor's cover is a still crop of the selected private image; the preview
shows the chosen portrait/square output frame. Thumbnail checks, earlier/later,
remove, optional per-photo captions and native or journal-photo selection remain.
No prototype illustration substitutes for a selected file.

The film title labels the saved draft and on-phone preview. It is an optional
JSON field on the existing SQLite draft; legacy films decode with an empty title
and retain their order, captions, aspect and private photo references. Title and
caption edits save through the controller. Failed writes keep the prior committed
film and the visible unsaved words, with Retry and an explicit leave choice.
No schema, draft slot, existing database filename or private directory changes.

On-phone editing/preview stay free. Preview uses the existing 2.8 seconds/photo,
with gentle pan/zoom when foregrounded and visible. It stops when offscreen,
backgrounded or reduced motion is on; explicit Previous/Next still allow review.
The displayed duration comes from the actual clip count. The board's three-second
sample is not a claim about encoded output.

MP4 remains Premium: current access is checked before render and again before
sharing. Explicit Debug preview stays separate from verified store entitlements
and unavailable in Release. Real store configuration remains deferred. Native
Media3/AVFoundation produce the existing silent 720p H.264 film, 30fps, 3–12
photos, 2.8 seconds per photo. Progress comes from the actual renderer; partial
files are removed on cancellation/failure and the saved draft remains available.
Sharing opens the native sheet and does not claim delivery merely from opening.

New outputs use a SoftPaws-film filename. Older BarkLog-film names are still
accepted by the guarded share adapters, and cleanup recognizes both prefixes.
Existing private directories and normal journals remain intact. No cloud/photo
upload, music catalog, new dependency, SDK upgrade or service key is introduced.

The explicit `soft-paws-video-v1` Debug review fixture uses its own SQLite file
and preference namespace. Its three synthetic private QA images are not personal
photos; native journeys run against real saved draft/photo rows and actual files.
Current build, native journey and visual evidence belongs to task010. Physical
playback, receiving-app delivery, assistive and supported minimum-OS behavior need
separate proof.
