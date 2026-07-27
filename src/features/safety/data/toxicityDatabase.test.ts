import {
  getCommonToxicityHazards,
  getToxicitySeverityLabel,
  getToxicityWeightContext,
  lookupToxicityItem,
  PET_POISON_HELPLINE_PHONE,
} from '@/features/safety/data/toxicityDatabase';

describe('toxicity database', () => {
  it('matches emergency aliases and keeps escalation language prominent', () => {
    const item = lookupToxicityItem('sugar-free gum');

    expect(item).toMatchObject({
      id: 'xylitol',
      poisonControlRecommended: true,
      severity: 'emergency',
    });
    expect(item?.action.toLowerCase()).toContain('call poison control');
    expect(getToxicitySeverityLabel(item?.severity ?? 'safe')).toBe('Call now');
  });

  it('handles lower-risk food with caution instead of false reassurance', () => {
    const item = lookupToxicityItem('plain peanut butter');

    expect(item).toMatchObject({
      id: 'peanut-butter',
      poisonControlRecommended: false,
      severity: 'caution',
    });
    expect(item?.action.toLowerCase()).toContain('xylitol');
    expect(getToxicitySeverityLabel(item?.severity ?? 'safe')).toBe(
      'Use caution',
    );
  });

  it('returns null for unknown or blank hazards', () => {
    expect(lookupToxicityItem('')).toBeNull();
    expect(lookupToxicityItem('mystery snack')).toBeNull();
  });

  it('keeps common hazards focused on high-risk poison-control cases', () => {
    const hazards = getCommonToxicityHazards();

    expect(hazards.map((item) => item.id)).toEqual([
      'chocolate',
      'grapes-raisins',
      'xylitol',
      'human-medications',
      'antifreeze',
      'rodenticide',
    ]);
    expect(hazards.every((item) => item.poisonControlRecommended)).toBe(true);
  });

  it('adds dog weight context without making dose judgments', () => {
    const item = lookupToxicityItem('grapes');

    if (!item) {
      throw new Error('Expected grapes to resolve to a toxicity item.');
    }

    expect(
      getToxicityWeightContext(item, {
        name: 'Milo',
        weightLbs: 28.5,
      }),
    ).toContain('Share that, the item, estimated amount, and time of exposure');
    expect(
      getToxicityWeightContext(item, {
        name: 'Milo',
        weightLbs: null,
      }),
    ).toContain('Add a weight to the profile for faster calls');
    expect(PET_POISON_HELPLINE_PHONE).toBe('855-764-7661');
  });
});
