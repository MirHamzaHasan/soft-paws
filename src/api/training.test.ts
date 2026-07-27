import {
  createTrainingQueryViewState,
  listTrainingProgramsWithSteps,
  trainingProgramsQueryOptions,
} from '@/api/training';

const mockFrom = jest.fn();

jest.mock('@/api/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
}));

type QueryResult<TData> = {
  data: TData;
  error: Error | null;
};

type TestQueryBuilder<TData> = {
  eq: jest.Mock<TestQueryBuilder<TData>, [string, string]>;
  in: jest.Mock<TestQueryBuilder<TData>, [string, string[]]>;
  order: jest.Mock<
    TestQueryBuilder<TData> | Promise<QueryResult<TData>>,
    [string, { ascending: boolean }]
  >;
  select: jest.Mock<TestQueryBuilder<TData>, [string]>;
};

function createTerminalOrderBuilder<TData>(
  result: QueryResult<TData>,
  terminalOrderCallCount: number,
) {
  let orderCallCount = 0;
  const builder: TestQueryBuilder<TData> = {
    eq: jest.fn((_column: string, _value: string) => builder),
    in: jest.fn((_column: string, _values: string[]) => builder),
    order: jest.fn((_column: string, _options: { ascending: boolean }) => {
      orderCallCount += 1;

      return orderCallCount >= terminalOrderCallCount
        ? Promise.resolve(result)
        : builder;
    }),
    select: jest.fn((_columns: string) => builder),
  };

  return builder;
}

describe('training API helpers', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('groups Supabase training programs with ordered steps', async () => {
    const programs = [
      {
        category: 'obedience',
        created_at: '2026-04-27T00:00:00.000Z',
        description: 'Build a reliable sit and stay.',
        difficulty: 'beginner',
        estimated_days: 7,
        icon: 'sit',
        id: 'program-1',
        name: 'Sit & stay foundations',
        slug: 'sit-stay-foundations',
        sort_order: 1,
      },
    ] as const;
    const steps = [
      {
        created_at: '2026-04-27T00:00:00.000Z',
        estimated_duration_min: 10,
        id: 'step-2',
        instruction: 'Add a short pause before the reward.',
        program_id: 'program-1',
        step_number: 2,
        tip: null,
        title: 'Add a pause',
      },
      {
        created_at: '2026-04-27T00:00:00.000Z',
        estimated_duration_min: 10,
        id: 'step-1',
        instruction: 'Lure into sit and reward the moment it happens.',
        program_id: 'program-1',
        step_number: 1,
        tip: null,
        title: 'Lure the sit',
      },
    ] as const;
    const programBuilder = createTerminalOrderBuilder(
      { data: [...programs], error: null },
      2,
    );
    const stepBuilder = createTerminalOrderBuilder(
      { data: [...steps], error: null },
      2,
    );

    mockFrom.mockImplementation((table: string) =>
      table === 'training_programs' ? programBuilder : stepBuilder,
    );

    await expect(listTrainingProgramsWithSteps()).resolves.toMatchObject([
      {
        id: 'program-1',
        steps: [{ id: 'step-1' }, { id: 'step-2' }],
      },
    ]);
    expect(mockFrom).toHaveBeenCalledWith('training_programs');
    expect(mockFrom).toHaveBeenCalledWith('training_steps');
    expect(stepBuilder.in).toHaveBeenCalledWith('program_id', ['program-1']);
  });

  it('exposes typed query options and view states for future screens', () => {
    const options = trainingProgramsQueryOptions();

    expect(options.queryKey).toEqual(['training', 'programs-with-steps']);
    expect(createTrainingQueryViewState({ isLoading: true })).toMatchObject({
      status: 'loading',
    });
    expect(createTrainingQueryViewState({ data: [] })).toMatchObject({
      isEmpty: true,
      status: 'success',
    });
    expect(
      createTrainingQueryViewState({ error: new Error('No network') }),
    ).toMatchObject({
      status: 'error',
    });
  });
});
