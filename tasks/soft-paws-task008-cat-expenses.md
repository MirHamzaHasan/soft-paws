# Soft Paws task008 · recorded cat-care expenses

21 October 2026. Status: research prepared; native implementation pending.

Approved destinations: `expenses`, `expense-form`, `expense-detail`. Keep local
SQLite costs, each original currency/minor unit, arbitrary dates, categories,
optional notes/image/PDF receipts, retained drafts, revision guards, confirmed
removal and shared attachment ownership. No currency conversion, inferred total
across currencies, transaction service or upload. CSV remains free; the new
cat report can already select Expenses. Existing data/receipts stay preserved.

Actual Mobbin MCP research inspected Brex's expense list:
https://mobbin.com/screens/1bec3e82-7d91-4969-afcf-5cbfb8402845
Take visible currency and date grouping only; the approved cat board and kit
remain the visual source. The board's USD 28.40 + 15.35 = 43.75 is labelled
example data. Native values must come from saved records, separated by currency.

Current native source is `ExpenseFeatureScreens.kt`. It already preserves typed
costs and native receipts but still uses the inherited screen composition and
includes historical Training categories. Keep existing category values; offer
cat-appropriate categories for new entries. Reuse `CareDateTimeField`, the shared
cat Back/footer, clear factual rows, labelled input, honest loading/empty/error,
receipt cancellation/missing-file recovery and the existing revision mechanics.
All three approved board surfaces were captured and inspected in both themes before native changes; captures are in the ignored expense QA folder. Verify
save/reopen/edit, retained/cancelled draft, separate currencies, receipt denial
and confirmed/cancelled delete through real SQLite/native adapters. Record paired
Android/iOS evidence and larger text before changing inventory status.

This preparation does not mark any of the three pending surfaces implemented.
The current implementation slice remains task007 until its final native/build
checks and evidence are delivered.
