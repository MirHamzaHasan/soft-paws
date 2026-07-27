import type { Model } from '@nozbe/watermelondb';

import {
  CareTaskModel,
  DogModel,
  EventModel,
  ExpenseModel,
  InsightModel,
  MedicationModel,
  PhotoBaselineModel,
  TrainingEnrollmentModel,
  TrainingSessionModel,
  UserModel,
  VaccinationModel,
} from './models';

export const barklogModelClasses: Array<typeof Model> = [
  UserModel,
  DogModel,
  EventModel,
  MedicationModel,
  InsightModel,
  VaccinationModel,
  ExpenseModel,
  TrainingEnrollmentModel,
  TrainingSessionModel,
  CareTaskModel,
  PhotoBaselineModel,
];
