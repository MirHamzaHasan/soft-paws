# Onboarding, AI value and revenue research

Research date: 16 October 2026. Prices: **undecided by owner request**. This is a
proposal for the board, not a revenue forecast or a production integration.

## What the references actually show

We inspected all 62 returned screens across these five Mobbin flows. Selected
high-resolution references are private in this folder; the original artwork is
not used in BarkLog screens. Static screenshots do not establish animation timing
or prove business performance.

| Reference | Observed order / mechanic | BarkLog decision |
| --- | --- | --- |
| [Finch onboarding, 21 screens](https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa) | Choose/hatch a companion → name → care explanation → reminders → starter plan → Plus offer → first day / commitment / widget | Create identity before an ask; show what a reminder is for. Keep a free choice. Do not copy streak pressure, reward currency or its art. |
| [Headspace onboarding, 21 screens](https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e) | Short breathing welcome → account → value → goal → plan → trial offer → experience → result → first course | Reuse answers in a visible result. Put the required account after the hands-on/AI example instead of before personalization. |
| [Headspace subscription, 10 screens](https://mobbin.com/flows/ccf14439-4c45-4d56-b031-45173490cafe) | Annual/monthly trial timeline → store confirmation → success → reminder ask → first exercise | Show both billing periods and dates clearly. Reach a useful action after choosing. Keep prices unresolved rather than borrowing theirs. |
| [Claude attachment, 7 screens](https://mobbin.com/flows/4bf99c87-ab26-48dd-ba9c-03650ac1a898) | Quiet start → attachment choices → picker → selected image above composer | Keep the reading column quiet and the composer reachable. BarkLog’s primary attachment is explicit care-record context, not automatic whole-journal access. |
| [ChatGPT threads, 3 screens](https://mobbin.com/flows/0f538b27-9afb-4f7f-8c52-d10f51e3218e) | Project start → identifiable conversations → persistent composer | Separate new conversation from finding a previous one. The returned flow is thread organization, not evidence about a whole ChatGPT onboarding. |

## Business evidence and its limits

[RevenueCat’s 2026 report](https://www.revenuecat.com/state-of-subscription-apps)
uses aggregated subscription-app observations, not randomized BarkLog experiments.
It reports that 55% of three-day-trial cancellations occur on day zero and that AI
apps have higher payer revenue but faster churn. Our inference: prove a repeatable
use in the first session, then measure whether people return to it. Neither a
longer quiz nor stronger paywall copy guarantees profit. The report’s hard-paywall
comparison is not a reason to remove this owner’s requested free tier.

## The proposed first session

Opening with a real interaction → dog name/photo → life stage → breed → caregiver
experience → up to two goals → daily rhythm → first AI topic → reminder schedule →
optional access → practice → grounded AI example → required account → answers become
a plan → free/Premium choice → ready → actual empty journal.

Single picks advance after 340 ms; multi-select gets Continue. Back and unknown
answers stay available. No invented assessment, fake processing delay or health
score. Every answer is used in Profile, plan, reminder state or chat starters.
The detailed path should be timed with real people; instrument drop-off before
adding more questions. A shorter optional-details path is an experiment to evaluate,
not an assumption that more screens improve revenue.

## Why someone would pay

The paid task is **put my own recorded context together without retyping it**.
A generic dog chatbot competes with free general chat. A date-scoped answer with
visible sources, a recurring recap and a usable appointment-question draft give a
specific reason to return. AI memory captions are secondary, not the headline.

| Free, including after cancellation | Premium proposal |
| --- | --- |
| Existing journal tools, notes, local photos, reminders, health record organization, training, expenses and Memory Book | Conversation from messages and explicitly selected care records |
| Timeline and factual charts | Generated date-scoped recaps with sources |
| CSV/PDF and manual appointment preparation | AI appointment-question drafts |
| Original records and previously kept conversation reading | AI memory-caption drafts |

No paid emergency escalation or medication advice. No removal of existing free
features. Login is the owner’s new design requirement, including free use. It adds
first-session friction; measure it, and justify the account-based value during
store review. Existing authenticated sessions should keep local logging available
offline. Journal ownership on sign-out/account switching needs a separate native
security design; sign-in must never silently upload or erase a device journal.

## Pricing and unit economics before launch

Monthly/yearly prices, trial eligibility, AI provider, model, usage allowance,
reset period and retention terms are **not decided**. The paywall makes that visible
and disables purchase. Review controls open a simulated Premium state so the rest
of the design remains testable. No “unlimited AI” promise or lifetime AI sale.

Use actual store proceeds and measured workloads:

`monthly contribution per payer = net subscription proceeds − AI inference cost − allocated hosting/auth/support cost − expected refunds`

`AI inference cost = paid sessions × turns/session × (input tokens × input rate + output tokens × output rate)`

Use provider rates per token consistently; include retries, long context, free-trial
usage and heavy-user percentiles. For annual plans, divide net annual proceeds by
12 to compare recurring monthly contribution; cash received is not monthly profit.
CAC payback needs measured retained contribution, not gross receipts. Fixed expenses
and taxes remain separate. Test a bounded allowance only after measuring actual
recap/chat cost; communicate it before purchase and show the reset date when reached.

## Experiments and decisions

| Test one change at a time | Primary measure | Guardrails |
| --- | --- | --- |
| Personal goal recap before offer vs a shorter factual recap | Onboarding completion and qualified Premium interest | Free-path completion, time to first real log |
| Onboarding offer vs a contextual offer after a grounded AI preview | Paid conversion per eligible exposed user | Record saving, refund/cancel rate, day-7 return |
| Monthly/yearly presentation and, later, approved price points | Net retained contribution per eligible user | Trial terms understood, no hidden annual charge |
| Proposed seven-day trial vs no trial, after store setup | Retained contribution and first useful AI task | Eligibility, usage costs, refunds, reminder delivery |
| Contextual recap prompt after several real records | Week-4 retained subscribers and weekly AI use | Source accuracy, unsupported claims, AI cost per active payer |

Record denominators, exposure rules and cohort dates; avoid calling a handful of
purchases a winner. Keep cancellation directly reachable. Do not ship hosted
analytics just to match this plan: event collection/provider/consent require their
own implementation decision. The local board sends no experiment events.

## Account, permission and AI facts

- [Firebase email-link migration](https://firebase.google.com/docs/auth/ios/email-link-migration):
  use supported Hosting and native App/Universal Links, not retired Dynamic Links.
- [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/):
  equivalent private sign-in, in-app deletion, clear subscription terms, relevant
  access only and explicit third-party-AI data permission. Mandatory free-journal
  login remains a proposed product decision, not a claim of review approval.
- [Android photo picker](https://developer.android.com/training/data-storage/shared/photo-picker):
  use selected images instead of whole-library permission.
- [Apple notification authorization](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications)
  and [Android runtime permission](https://developer.android.com/develop/ui/compose/notifications/notification-permission):
  explain and request at the chosen reminder action; denial cannot block logging.

[ASPCA Poison Control](https://www.aspca.org/pet-care/aspca-poison-control) reinforces
that suspected poisoning needs veterinary toxicology guidance, rather than an AI
assessment. The board escalates and organizes facts; it gives no treatment or doses.

This board previews iOS/Android sheets (`?platform=android`). A browser board cannot
grant native permissions. It also cannot authenticate Firebase, bill a store, send
an email or run AI. All provider, privacy and price promises must be verified
against the actual service before native implementation and release.
