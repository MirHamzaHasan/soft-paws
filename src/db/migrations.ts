import {
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export const barklogMigrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'dog_training_enrollments',
          columns: [
            { name: 'dog_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'program_id', type: 'string', isIndexed: true },
            { name: 'current_step', type: 'number' },
            { name: 'started_at', type: 'number' },
            { name: 'completed_at', type: 'number', isOptional: true },
            { name: 'status', type: 'string', isIndexed: true },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'training_sessions',
          columns: [
            { name: 'enrollment_id', type: 'string', isIndexed: true },
            { name: 'dog_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'step_id', type: 'string', isIndexed: true },
            { name: 'duration_min', type: 'number', isOptional: true },
            { name: 'success_rating', type: 'number', isOptional: true },
            { name: 'dog_mood', type: 'string', isOptional: true },
            { name: 'notes', type: 'string', isOptional: true },
            { name: 'completed_at', type: 'number' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'care_tasks',
          columns: [
            { name: 'dog_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'type', type: 'string', isIndexed: true },
            { name: 'title', type: 'string' },
            { name: 'due_at', type: 'string', isIndexed: true },
            { name: 'recurrence', type: 'string' },
            { name: 'reminder_enabled', type: 'boolean' },
            { name: 'completed_at', type: 'string', isOptional: true },
            { name: 'notes', type: 'string', isOptional: true },
            { name: 'related_medication_id', type: 'string', isOptional: true },
            { name: 'remaining_count', type: 'number', isOptional: true },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'photo_baselines',
          columns: [
            { name: 'dog_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'category', type: 'string', isIndexed: true },
            { name: 'title', type: 'string' },
            { name: 'body_area', type: 'string', isOptional: true },
            { name: 'captured_at', type: 'number', isIndexed: true },
            { name: 'photo_uri', type: 'string', isOptional: true },
            { name: 'notes', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
