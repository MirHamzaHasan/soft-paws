/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import { getBarklogDatabase } from '../database';
import type { InsightModel } from '../models';

type UpsertLocalInsightInput = {
  content: string;
  dogId: string;
  generatedAt?: number | null;
  promptVersion: string;
  weekStart: string;
};

function getInsightCollection() {
  return getBarklogDatabase().get('insights') as Collection<InsightModel>;
}

export async function getLocalInsightForWeek(input: {
  dogId: string;
  weekStart: string;
}) {
  const { dogId, weekStart } = input;

  return getInsightCollection()
    .query(Q.where('dog_id', dogId), Q.where('week_start', weekStart))
    .fetch()
    .then((records) => records[0] ?? null);
}

export async function upsertLocalInsight(input: UpsertLocalInsightInput) {
  const database = getBarklogDatabase();
  const insightCollection = getInsightCollection();
  const now = Date.now();

  const insight = await database.write(async () => {
    const existingInsight = await getLocalInsightForWeek({
      dogId: input.dogId,
      weekStart: input.weekStart,
    });

    if (existingInsight) {
      return existingInsight.update((record) => {
        record.content = input.content;
        record.generatedAt = input.generatedAt ?? now;
        record.promptVersion = input.promptVersion;
      });
    }

    return insightCollection.create((record) => {
      record.content = input.content;
      record.dogId = input.dogId;
      record.generatedAt = input.generatedAt ?? now;
      record.promptVersion = input.promptVersion;
      record.weekStart = input.weekStart;
    });
  }, 'upsertLocalInsight');


  return insight;
}
