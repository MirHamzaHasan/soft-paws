alter table public.events
  drop constraint if exists events_type_check;

alter table public.events
  add constraint events_type_check check (
    type in (
      'poop',
      'pee',
      'meal',
      'walk',
      'medication',
      'symptom',
      'grooming',
      'weight',
      'note',
      'mood',
      'behavior',
      'training',
      'water',
      'rest',
      'vomit',
      'cough_sneeze',
      'mobility',
      'appetite',
      'dental',
      'parasite_prevention',
      'vet_visit'
    )
  );
