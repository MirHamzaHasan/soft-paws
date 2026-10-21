# Native Files input for Soft Paws QA

This tiny UIKit fixture exposes its own synthetic PDF/JPEG in **On My iPhone →
SoftPaws QA Files**. It is a separate simulator app, `com.draco.qa.softpaws.files`.
It never links the product framework, opens a care database or writes inside
Soft Paws. The product's storage/Files settings remain unchanged.

Prepare it with Xcode on the owned simulator:

```sh
python3 tools/native-document-qa/prepare_ios.py --device <owned-simulator-UUID>
```

The explicit XCTest cases `SoftPawsHealthJourneys/testVaccinationPdfImportDraftAndNativeHandoff`
and `testVaccinationImageReplacesPdfThroughNativeFiles` select these actual files
through the production `UIDocumentPicker`, then save/reopen in the real review
SQLite journal. Run the PDF case before the image replacement case. These tests
use `soft-paws-day-v1`; they never clear a journal or seed a document into the
product's private files. Physical-device document-provider behavior is a separate
check. Build output stays in ignored `.verify-build/soft-paws-document-fixture/`.
