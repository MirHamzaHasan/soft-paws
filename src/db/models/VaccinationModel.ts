import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class VaccinationModel extends Model {
  static table = 'vaccinations';

  static associations = {
    dogs: { type: 'belongs_to', key: 'dog_id' },
  } as const;

  @field('created_at') createdAt: number;

  @field('date_given') dateGiven: string | null;

  @field('dog_id') dogId: string;

  @text('name') name: string;

  @field('next_due') nextDue: string | null;

  @field('notes') notes: string | null;

  @field('record_photo_url') recordPhotoUrl: string | null;

  @field('vet_name') vetName: string | null;
}
