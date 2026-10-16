# Native conversion review

Open [index.html](index.html) or serve this directory locally. The pack contains
all 123 product IDs, original screenshots, source versions and explicit missing
checks. It changes no task status or owner approval.

The current native source fingerprint is in [checks](checks/source-fingerprints.txt).
[Verification](../../../../verification.md) records executed checks and limits.
[Diagnostic motion](motion/README.md) is versioned separately.

Regenerate with:

```sh
python3 tools/build_native_review.py docs/design/evidence/task022/review-capture-batches.json
```
