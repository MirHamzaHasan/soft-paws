import {
  buildEventDetailRows,
  getEventPresentation,
} from '@/features/archive/utils/eventPresentation';

import { makeEventModel } from '../../../../test/utils/builders';

describe('event presentation', () => {
  it('presents training timeline events with step and session details', () => {
    const event = makeEventModel({
      details: {
        dog_mood: 'calm',
        duration_min: 12,
        enrollment_id: 'enrollment-1',
        program_name: 'Loose leash walking',
        step_number: 3,
        step_title: 'Add mild distractions',
        success_rating: 4,
      },
      type: 'training',
    });

    expect(getEventPresentation(event)).toMatchObject({
      detail: 'Loose leash walking • Step 3 • 12 min • 4/5 success',
      emoji: '🎓',
      title: 'Training: Add mild distractions',
    });
    expect(buildEventDetailRows(event)).toEqual(
      expect.arrayContaining([
        { label: 'Program', value: 'Loose leash walking' },
        { label: 'Step', value: 'Step 3' },
        { label: 'Success rating', value: '4 of 5' },
        { label: 'Dog mood', value: 'Calm' },
      ]),
    );
  });

  it('presents expanded care events as owner observations', () => {
    const vomitEvent = makeEventModel({
      details: {
        appearance: 'bile',
        frequency: 'multiple',
      },
      type: 'vomit',
    });
    const preventionEvent = makeEventModel({
      details: {
        prevention_type: 'heartworm',
        product_name: 'Monthly chew',
      },
      type: 'parasite_prevention',
    });

    expect(getEventPresentation(vomitEvent)).toMatchObject({
      detail: 'Bile • Multiple',
      emoji: '🤢',
      title: 'Vomit',
    });
    expect(buildEventDetailRows(vomitEvent)).toEqual(
      expect.arrayContaining([
        { label: 'Appearance', value: 'Bile' },
        { label: 'Frequency', value: 'Multiple' },
      ]),
    );
    expect(getEventPresentation(preventionEvent)).toMatchObject({
      detail: 'Heartworm • Monthly chew',
      emoji: '🛡️',
      title: 'Prevention',
    });
  });
});
