import {
  buildLocalVetQuestions,
  buildVetReportAiContext,
  buildVetShareReportSnapshot,
} from '@/features/vet/utils/vetReportBuilder';

import {
  makeDogRow,
  makeEventModel,
  makeMedicationModel,
} from '../../../../test/utils/builders';

describe('vet report builder', () => {
  it('builds a factual, structured vet report context from local records', () => {
    const context = buildVetReportAiContext({
      dog: makeDogRow({
        birthdate: '2021-04-15',
        name: 'Milo',
      }),
      events: [
        makeEventModel({
          details: {
            symptoms: ['vomiting'],
          },
          id: 'symptom-1',
          notes: 'Vomited once after breakfast',
          type: 'symptom',
        }),
        makeEventModel({
          details: {
            mood: 'calm',
            energy: 'normal',
          },
          id: 'mood-1',
          type: 'mood',
        }),
        makeEventModel({
          details: {
            behavior: 'barking',
            intensity: 'moderate',
            trigger: 'guests',
          },
          id: 'behavior-1',
          type: 'behavior',
        }),
        makeEventModel({
          details: {
            program_name: 'Loose leash walking',
            step_title: 'Reward check-ins',
            success_rating: 4,
          },
          id: 'training-1',
          type: 'training',
        }),
      ],
      medications: [
        makeMedicationModel({
          frequency: 'daily',
          name: 'Carprofen',
          notes: 'Give with food',
        }),
      ],
      range: {
        endIso: '2026-04-27T00:00:00.000Z',
        label: 'Last 30 days',
        startIso: '2026-03-29T00:00:00.000Z',
      },
    });

    expect(context.dog.name).toBe('Milo');
    expect(context.eventCounts.symptom).toBe(1);
    expect(context.sections.medications[0]).toContain('Carprofen');
    expect(context.sections.symptomsAndObservations[0]).toContain('vomiting');
    expect(context.sections.behaviorAndMood.join('\n')).toContain(
      'Behavior: Barking',
    );
    expect(context.sections.training[0]).toContain('Loose leash walking');
    expect(context.urgentReviewNotes[0]).toContain('Vomited once');
  });

  it('adds mood, behavior, and training questions when those logs exist', () => {
    const context = buildVetReportAiContext({
      dog: makeDogRow(),
      events: [
        makeEventModel({ id: 'mood-1', type: 'mood' }),
        makeEventModel({ id: 'behavior-1', type: 'behavior' }),
        makeEventModel({ id: 'training-1', type: 'training' }),
      ],
      medications: [],
      range: {
        endIso: '2026-04-27T00:00:00.000Z',
        label: 'Last 30 days',
        startIso: '2026-03-29T00:00:00.000Z',
      },
    });

    const questions = buildLocalVetQuestions(context);

    expect(questions.join('\n')).toContain('mood or behavior notes');
    expect(questions.join('\n')).toContain('training limits');
  });

  it('builds a share snapshot without adding diagnostic language', () => {
    const context = buildVetReportAiContext({
      dog: makeDogRow(),
      events: [],
      medications: [],
      range: {
        endIso: '2026-04-27T00:00:00.000Z',
        label: 'Last 30 days',
        startIso: '2026-03-29T00:00:00.000Z',
      },
    });

    const snapshot = buildVetShareReportSnapshot({
      context,
      generatedReport: {
        generatedAt: '2026-04-27T00:00:00.000Z',
        promptVersion: 'vet-report-v1',
        questions: ['Do any logs need follow-up?'],
        summary:
          'Milo had caregiver-entered logs available for review in this range.',
      },
    });

    expect(snapshot.generatedReport?.summary).not.toMatch(/diagnosed|has/i);
    expect(snapshot.context.range.label).toBe('Last 30 days');
  });
});
