/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import { getBarklogDatabase } from '../database';
import type { ExpenseModel } from '../models';
import type { BarklogExpenseCategory } from '../types';

export type LocalExpenseInput = {
  amount: number;
  category: BarklogExpenseCategory;
  date: string;
  description?: string | null;
  dogId: string;
  receiptPhotoUrl?: string | null;
  userId: string;
};

function getExpenseCollection() {
  return getBarklogDatabase().get('expenses') as Collection<ExpenseModel>;
}

export async function createLocalExpense(input: LocalExpenseInput) {
  const database = getBarklogDatabase();
  const expenseCollection = getExpenseCollection();
  const now = Date.now();

  const expense = await database.write(
    async () =>
      expenseCollection.create((record) => {
        record.amount = input.amount;
        record.category = input.category;
        record.createdAt = now;
        record.date = input.date;
        record.description = input.description?.trim() || null;
        record.dogId = input.dogId;
        record.receiptPhotoUrl = input.receiptPhotoUrl ?? null;
        record.userId = input.userId;
      }),
    'createLocalExpense',
  );


  return expense;
}

export async function listLocalExpensesForDogYear(input: {
  dogId: string;
  year: number;
}) {
  const startDate = `${input.year}-01-01`;
  const endDate = `${input.year + 1}-01-01`;

  return getExpenseCollection()
    .query(
      Q.where('dog_id', input.dogId),
      Q.where('date', Q.gte(startDate)),
      Q.where('date', Q.lt(endDate)),
      Q.sortBy('date', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}

export async function listLocalExpensesForDog(dogId: string) {
  return getExpenseCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.sortBy('date', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}
