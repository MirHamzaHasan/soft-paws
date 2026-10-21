# Soft Paws Safety · implementation contract

Task006 ports the nine approved cat Safety destinations. Native implementation and simulator checks pass;
acceptance scope and remaining limits are tracked in [the task](../../tasks/soft-paws-task006-cat-safety.md).
No task status or build establishes individual native visual approval.

## Local contacts and observations

Saved veterinarian and emergency-clinic/service contacts are the two existing
profile slots. Each has an independent optional address/note. The general profile
note, other contact, profile facts, UUID, journal and captured revision remain
intact. New note fields default to blank when old JSON is decoded; no SQLite
schema change or filename change is required. The established emergency-editor
draft slot remains compatible. Save removes its draft only after the profile
transaction succeeds. Explicitly clearing one contact preserves the other slot.

The observation checklist passes selected caregiver wording into the contacts
screen. It does not calculate severity or add a Journal record. Exposure wording
stays in retained screen state until the caregiver explicitly asks AI. Contact
access, country listings and general call preparation do not require an account,
AI consent, Premium or location permission.

## Primary-source review · 21 October 2026

The existing brief feline guidance was rechecked against these primary sources.
It directs caregivers to a professional; it never supplies treatment or a dose.

| Subject | Source and bounded use |
| --- | --- |
| Little/no urine during repeated attempts | [Cornell Feline Health Center](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease): supports immediate veterinary contact, without diagnosing the cause. |
| Lily exposure | [US FDA](https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination): includes pollen and vase water; call a veterinarian or poison service immediately. |
| Home-induced vomiting | [ASPCA](https://www.aspca.org/news/it-ever-safe-induce-vomiting): do not attempt home remedies or induce vomiting in a cat. |
| Human medicines and dog flea products | [Cornell common cat hazards](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/common-cat-hazards): preserve the exact product label for the professional. |
| United States animal poison service | [ASPCA Poison Control](https://www.aspca.org/pet-care/aspca-poison-control): (888) 426-4435; 24/7; consultation fees may apply. |
| Canada, Australia, New Zealand and Singapore | [Animal Poisons Helpline](https://www.animalpoisons.com.au/): displayed numbers match its country listings. Purpose and fee caveats stay visible; domestic numbers may not work abroad. |
| United Kingdom | [Animal PoisonLine](https://www.animalpoisonline.co.uk/): 01202 509000; animal poisoning only, 24 hours, paid consultation. |

Region entry accepts explicit supported country names/codes and limited exact
aliases. An unsupported place never receives an invented local/national number.
The phone's region is not treated as proof of its physical location. Listings
can become outdated; their source date and service website remain visible.

## Optional Maps and AI

Maps search retains the existing Premium boundary. Manual place entry needs no
permission; punctuation and non-English text survive the fallback route. A
one-shot approximate area stays in memory on that screen and is excluded from
saved navigation, Journal data and AI context. Opening Google Maps sends only
the chosen search place. There are no fabricated clinics, hours, distances,
nearest-clinic claims or guaranteed worldwide results.

Safety AI now uses cat-specific prompts and bounded optional exposure wording.
It retains Premium checks, versioned per-cat weekly consent, fresh identity,
server admission/context receipts and the Release gate. A changed cat/account/
consent invalidates an in-flight result. A design preview is labelled and never
becomes a real entitlement or live reply. Unconfigured builds show the service
as unavailable. This task authorizes no live AI recheck, configuration, purchase,
automatic upload or journal sync.
