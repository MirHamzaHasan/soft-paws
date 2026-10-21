# Soft Paws · private photos and Memory Book

The photo picker, photo detail and monthly Memory Book use the approved cat kit
in shared Compose. The native Android/iOS pickers copy only the chosen image to
private local storage. The library original remains outside journal ownership.
There is no upload, cloud backup or account requirement for these records.

The image preview and its title row both open the saved photo details. A photo
keeps its own title, entered date, caption, reference category and body area. Existing/custom categories remain readable. Missing files retain metadata
and offer replacement. Picker/editor view caches reset between completed imports; SQLite drafts retain
their request IDs, values and attachment references. Confirmed
removal uses the captured saved revision and the existing cleanup queue.

Photo captions and collection captions are independent. The inline monthly
inclusion choice commits the photo and linked collection changes in one SQLite
transaction. A captured map of linked collection revisions detects concurrent
changes before either is written. Unchecking removes only that photo from the
matching month's collections, preserving collection IDs, captions, other source
IDs and retained unavailable links. An empty collection with an explicit month
can retain its caption. New months are explicit; legacy collections without a
month keep their existing timestamp/time-zone behavior. No schema or database
filename changes are needed for this optional JSON field.

The monthly book uses only explicitly chosen saved sources for this cat. The
collection, source-reading, caption and native export subflows remain available.
Collection actions include their title for screen readers. On-phone reading stays free. PDF/print/sharing check current Premium access;
Debug preview remains separate from real entitlements and unavailable in Release.
PDF preparation reads fresh records, then explicit Share/Print actions open the
native sheet. Missing sources are labelled honestly; a missing chosen collection
never falls back to exporting the whole month.

Photo report inclusion follows the entered date, including archival dates before
1970, rather than the record's later import timestamp. Care observations are not
invented by saving photos or collections.

Storage tests cover atomic rollback, stale photo/collection revisions, retained
drafts/files/captions, cat isolation, legacy JSON decoding, disk reopen, entered
dates and travel across month/time-zone boundaries. Platform runtime, larger-text
and final build evidence are tracked in task009; do not infer them from this
implementation note.
