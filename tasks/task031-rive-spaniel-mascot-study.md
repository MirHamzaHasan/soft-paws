# task031 — Rive spaniel mascot study

Owner request: 17 October 2026. After installing Rive and verifying its local
MCP connection, the owner requested a dog test and explicitly allowed replacing
the earlier low-quality character. This authorizes a new visual study and Rive
authoring; the new mascot has not been approved or integrated into KMP.

Status: Rive art/controller/export and exported-player validation complete;
owner review/native adoption remain separate. The owner responded positively
to Rive during the preview; that does not authorize a native replacement yet.

Uses Ungenerated app workflow, motion system, bubbly motion, accessibility,
no-slop and visual QA. Preserve a transparent interaction ground and quiet idle
gaps; no decorative gradients, shadows, scenery or journal writes.

## Slice

Original chestnut spaniel with expressive eyes, brows, cream markings, separate
ears/tail/paws/muzzle/tag and a greeting paw detail. Seven editable Rive clips
and a real trigger-driven controller with 200 ms action blending and 180 ms
returns. A local browser plays the actual `.riv`, with six manual reactions,
shuffled idles, light/dark ground, a Home-card context, keyboard greeting,
pause/resume, reduced-motion neutral, offscreen/visibility cancellation and cleanup.

The owner-selected Rive workflow supersedes task030's free-only authoring
constraint for this study. Runtime export works. Rive's current workspace still
includes the required splash in exports, and refused `.rev` backup for its plan;
no plan change was made and no restriction was bypassed. The editable cloud
file plus original vector/motion/rebuild sources are retained. The Rive export
is a runtime file, not an editable backup.

Source, rebuild and plan details:
[Rive study](../design/board/refinements/rive-dog/README.md).
Evidence: [task031](../docs/design/evidence/task031/README.md).

Validation: 32 browser captures including 18 actual mid-motion frames; all six
trigger actions return to Idle; alpha edges/clipping, interruption, keyboard,
pause, reduced motion, random scheduling, offscreen behavior, real page cleanup
and Back, both themes, 375/390px/130% text and 44px controls passed. Fourteen
contrast pairs pass their text/non-text thresholds. No external playback requests
or browser/resource errors. The update-motion/re-export authoring path was run;
the fresh-file seed command has not been independently exercised end to end.

No native Rive dependency or app runtime/art change belongs to this task.
Owner review and a later validated Android/iOS slice are needed before adopting
the new character. Existing journals and both simulator apps are preserved.


Subsequent owner authorization on 2026-10-17 activated Draco Arts Studios Cadet and
requested native adoption. [Task032](task032-native-rive-mascot.md) delivers the
clean paid export, editable .rev and verified Android/iOS integration. The free
workspace export limitation above records task031's original scope only.
