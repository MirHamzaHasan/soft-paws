export type WatermelonCreateBuilder<TRecord extends object> = (
  record: TRecord,
) => void;

export function createWatermelonWriteHarness<TRecord extends object>() {
  const record = {} as TRecord;
  const collection = {
    create: jest.fn((builder: WatermelonCreateBuilder<TRecord>) => {
      builder(record);

      return record;
    }),
  };
  const database = {
    get: jest.fn(() => collection),
    localStorage: {
      get: jest.fn(async () => undefined),
      set: jest.fn(async () => undefined),
    },
    write: jest.fn(async (work: () => unknown) => work()),
  };

  return {
    collection,
    database,
    record,
  };
}
