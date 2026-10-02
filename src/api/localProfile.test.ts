import {
  bootstrapLocalProfile,
  completeOnboardingForCurrentUser,
  createDogForCurrentUser,
  deleteAllLocalData,
} from '@/api/localProfile';
import { getBarklogDatabase } from '@/db/database';

jest.mock('@/db/database', () => ({ getBarklogDatabase: jest.fn() }));

describe('local profile repository', () => {
  const tables = {
    users: [] as Array<Record<string, unknown>>,
    dogs: [] as Array<Record<string, unknown>>,
  };
  const database = {
    get: jest.fn((table: 'users' | 'dogs') => ({
      create: jest.fn(
        async (build: (record: Record<string, unknown>) => void) => {
          const record: Record<string, unknown> = {
            id: `${table}-${tables[table].length + 1}`,
          };
          build(record);
          tables[table].push(record);
          return record;
        },
      ),
      query: jest.fn(() => ({
        fetch: jest.fn(async () => [...tables[table]]),
      })),
    })),
    unsafeResetDatabase: jest.fn(async () => {
      tables.users.length = 0;
      tables.dogs.length = 0;
    }),
    write: jest.fn(async (work: () => unknown) => work()),
  };

  beforeEach(() => {
    tables.users.length = 0;
    tables.dogs.length = 0;
    jest.mocked(getBarklogDatabase).mockReturnValue(database as never);
  });

  it('creates one stable owner, saves dogs, and restores onboarding from local records', async () => {
    const first = await bootstrapLocalProfile();
    expect(first.dogs).toEqual([]);
    expect(first.onboardingStatus).toBe('required');

    const completed = await completeOnboardingForCurrentUser(
      first.barklogUser.id,
      {
        age: '2',
        breed: 'Mixed',
        name: 'Milo',
        sex: 'male',
        status: 'neutered',
        weight: '12',
        weightUnit: 'kg',
      } as never,
    );
    expect(completed.dog).toMatchObject({
      name: 'Milo',
      is_primary: true,
      sex: 'neutered_male',
    });
    expect(completed.dog.weight_lbs).toBeCloseTo(26.46, 2);

    const restored = await bootstrapLocalProfile();
    expect(restored.barklogUser.id).toBe(first.barklogUser.id);
    expect(restored.onboardingStatus).toBe('complete');
    expect(restored.dogs).toHaveLength(1);

    await createDogForCurrentUser(first.barklogUser.id, { name: 'Luna' });
    expect((await bootstrapLocalProfile()).dogs).toHaveLength(2);
  });

  it('creates only one owner when bootstrap runs concurrently', async () => {
    const [first, second] = await Promise.all([
      bootstrapLocalProfile(),
      bootstrapLocalProfile(),
    ]);
    expect(first.barklogUser.id).toBe(second.barklogUser.id);
    expect(tables.users).toHaveLength(1);
  });

  it('deletes all local records and returns to onboarding', async () => {
    const first = await bootstrapLocalProfile();
    await completeOnboardingForCurrentUser(first.barklogUser.id, {
      name: 'Milo',
      breed: '',
      sex: 'male',
      status: null,
      age: '',
      weight: '',
      weightUnit: 'lb',
    } as never);
    await deleteAllLocalData();
    const afterDelete = await bootstrapLocalProfile();
    expect(afterDelete.dogs).toEqual([]);
    expect(afterDelete.onboardingStatus).toBe('required');
    expect(database.unsafeResetDatabase).toHaveBeenCalled();
  });
});
