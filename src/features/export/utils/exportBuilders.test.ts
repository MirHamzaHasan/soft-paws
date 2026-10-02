import {
  buildEventsCsv,
  buildExpensesCsv,
  buildMemoryBookText,
  buildVetReportHtml,
  getWalkMinutes,
  summarizeEventCounts,
} from '@/features/export/utils/exportBuilders';

import {
  makeDogRow,
  makeEventModel,
  makeExpenseModel,
  makeMedicationModel,
} from '../../../../test/utils/builders';

describe('export builders', () => {
  it('builds CSV exports with escaped caregiver data and no premium dependency', () => {
    const dog = makeDogRow({
      id: 'dog-1',
      name: 'Milo "Bean"',
    });
    const csv = buildEventsCsv({
      dog,
      events: [
        makeEventModel({
          details: {
            count: 2,
            quality: 'firm',
          },
          id: 'event-1',
          notes: 'Ate "treats", then settled',
          occurredAt: Date.parse('2026-04-26T08:00:00.000Z'),
          type: 'poop',
        }),
      ],
    });

    expect(csv).toContain(
      '"dog_id","dog_name","event_id","type","occurred_at","logged_at","notes","details_json","photo_url"',
    );
    expect(csv).toContain('"Milo ""Bean"""');
    expect(csv).toContain('"Ate ""treats"", then settled"');
    expect(csv).toContain('"{""count"":2,""quality"":""firm""}"');
  });

  it('builds expense CSV values with two-decimal amounts', () => {
    const csv = buildExpensesCsv({
      dog: makeDogRow(),
      expenses: [
        makeExpenseModel({
          amount: 42,
          category: 'medication',
          description: 'Monthly tablets',
        }),
      ],
    });

    expect(csv).toContain('"medication","42.00","Monthly tablets"');
  });

  it('summarizes event counts and walk minutes for vet-facing reports', () => {
    const events = [
      makeEventModel({
        details: {
          behavior: 'barking',
          intensity: 'mild',
          trigger: 'guests',
        },
        id: 'event-1',
        type: 'behavior',
      }),
      makeEventModel({ type: 'meal' }),
      makeEventModel({
        details: {
          duration_min: 20,
        },
        id: 'event-3',
        type: 'walk',
      }),
      makeEventModel({
        details: {
          duration_min: 15,
        },
        id: 'event-4',
        type: 'walk',
      }),
      makeEventModel({
        details: {
          appetite: 'less_than_usual',
        },
        id: 'event-5',
        type: 'appetite',
      }),
    ];

    expect(summarizeEventCounts(events)).toMatchObject({
      appetite: 1,
      behavior: 1,
      meal: 1,
      walk: 2,
    });
    expect(getWalkMinutes(events)).toBe(35);
  });

  it('escapes vet report HTML and keeps the non-diagnostic disclaimer', () => {
    const html = buildVetReportHtml({
      dog: makeDogRow({
        name: 'Milo <Bean>',
      }),
      events: [
        makeEventModel({
          details: {
            behavior: 'barking',
            intensity: 'moderate',
            trigger: 'guests',
          },
          notes: 'Doorbell rang twice',
          type: 'behavior',
        }),
        makeEventModel({
          details: {
            symptoms: ['vomiting', 'lethargy'],
          },
          notes: '<script>alert("bad")</script>',
          type: 'symptom',
        }),
      ],
      generatedAt: new Date('2026-04-26T12:00:00.000Z'),
      medications: [
        makeMedicationModel({
          frequency: 'daily',
          name: 'Carprofen',
          notes: 'Give with food',
        }),
      ],
      rangeLabel: 'Last 7 days',
    });

    expect(html).toContain('Milo &lt;Bean&gt; Patient Summary');
    expect(html).toContain(
      '&lt;script&gt;alert(&quot;bad&quot;)&lt;/script&gt;',
    );
    expect(html).toContain(
      'Behavior: Barking, moderate intensity, trigger: Guests',
    );
    expect(html).toContain('It is not a diagnosis');
    expect(html).not.toContain('<script>alert("bad")</script>');
  });

  it('builds a memory book text export from already-approved narrative content', () => {
    const text = buildMemoryBookText({
      activeHours: '6h 30m',
      dogName: 'Milo',
      mealCount: 42,
      monthLabel: 'April',
      narrative: 'Milo kept a steady care rhythm this month.',
      photoCount: 8,
      walkCount: 24,
    });

    expect(text).toContain("Milo's April BarkLog Memory Book");
    expect(text).toContain('Walks logged: 24');
    expect(text).toContain('Photos captured: 8');
  });
});
