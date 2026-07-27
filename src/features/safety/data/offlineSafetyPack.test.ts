import type { MedicationModel } from '@/db';

import { buildEmergencyCard, OFFLINE_SAFETY_PACK } from './offlineSafetyPack';

jest.mock('./firstAidGuides', () => ({
  FIRST_AID_GUIDES: {
    bleeding: { title: 'Bleeding' },
    choking: { title: 'Choking' },
    cpr: { title: 'CPR' },
    heatstroke: { title: 'Heatstroke' },
    poisoning: { title: 'Poisoning' },
    seizure: { title: 'Seizure' },
  },
  QUICK_FIRST_AID_TOPICS: ['choking', 'bleeding', 'heatstroke'],
}));

describe('offlineSafetyPack', () => {
  it('keeps every safety metadata entry available offline', () => {
    expect(OFFLINE_SAFETY_PACK.metadata).toHaveLength(3);
    expect(
      OFFLINE_SAFETY_PACK.metadata.every((entry) => entry.offline_available),
    ).toBe(true);
    expect(
      OFFLINE_SAFETY_PACK.metadata.map((entry) => entry.source).join(' '),
    ).toContain('ASPCA');
  });

  it('includes poison-control contacts, first aid, CPR, transport, and hazards', () => {
    expect(OFFLINE_SAFETY_PACK.contacts.some((contact) => contact.phone)).toBe(
      true,
    );
    expect(OFFLINE_SAFETY_PACK.poisonControlAction.phone).toBe('888-426-4435');
    expect(OFFLINE_SAFETY_PACK.firstAidTopics).toContain('choking');
    expect(OFFLINE_SAFETY_PACK.cprTopic).toBe('cpr');
    expect(OFFLINE_SAFETY_PACK.safeTransportChecklist.length).toBeGreaterThan(
      3,
    );
    expect(OFFLINE_SAFETY_PACK.toxicityHazardIds).toContain('xylitol');
  });

  it('builds a local emergency card without network or premium data', () => {
    const card = buildEmergencyCard({
      dog: {
        birthdate: null,
        breed: 'Mixed',
        created_at: '2026-04-27T00:00:00.000Z',
        id: 'dog-1',
        is_primary: true,
        name: 'Buddy',
        photo_url: null,
        sex: null,
        user_id: 'user-1',
        weight_lbs: 42,
      },
      medications: [
        {
          active: true,
          createdAt: 0,
          dogId: 'dog-1',
          doseMg: 10,
          endDate: null,
          frequency: 'daily',
          giveWithFood: true,
          id: 'med-1',
          name: 'Test medication',
          notes: null,
          refillDate: null,
          scheduleTimes: [],
          startDate: null,
        } as unknown as MedicationModel,
      ],
    });

    expect(card.dogName).toBe('Buddy');
    expect(card.weightLabel).toBe('42.0 lb');
    expect(card.profileStatus).toBe('complete');
    expect(card.medications[0]).toContain('Test medication');
  });
});
