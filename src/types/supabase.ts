export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      dogs: {
        Row: {
          birthdate: string | null;
          breed: string | null;
          created_at: string | null;
          id: string;
          is_primary: boolean | null;
          name: string;
          photo_url: string | null;
          sex: 'female' | 'male' | 'neutered_male' | 'spayed_female' | null;
          user_id: string;
          weight_lbs: number | null;
        };
        Insert: {
          birthdate?: string | null;
          breed?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          name: string;
          photo_url?: string | null;
          sex?: 'female' | 'male' | 'neutered_male' | 'spayed_female' | null;
          user_id: string;
          weight_lbs?: number | null;
        };
        Update: {
          birthdate?: string | null;
          breed?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          name?: string;
          photo_url?: string | null;
          sex?: 'female' | 'male' | 'neutered_male' | 'spayed_female' | null;
          user_id?: string;
          weight_lbs?: number | null;
        };
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'dogs_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      dog_training_enrollments: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          current_step: number | null;
          dog_id: string;
          id: string;
          program_id: string;
          started_at: string | null;
          status: 'abandoned' | 'active' | 'completed' | 'paused' | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          current_step?: number | null;
          dog_id: string;
          id?: string;
          program_id: string;
          started_at?: string | null;
          status?: 'abandoned' | 'active' | 'completed' | 'paused' | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          current_step?: number | null;
          dog_id?: string;
          id?: string;
          program_id?: string;
          started_at?: string | null;
          status?: 'abandoned' | 'active' | 'completed' | 'paused' | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'dog_training_enrollments_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['program_id'];
            foreignKeyName: 'dog_training_enrollments_program_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'training_programs';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'dog_training_enrollments_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      care_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          dog_id: string;
          due_at: string;
          id: string;
          notes: string | null;
          recurrence: 'custom' | 'daily' | 'monthly' | 'none' | 'weekly';
          related_medication_id: string | null;
          remaining_count: number | null;
          reminder_enabled: boolean;
          title: string;
          type:
            | 'custom'
            | 'grooming'
            | 'medication_refill'
            | 'parasite_prevention'
            | 'training_practice'
            | 'vaccination'
            | 'vet_follow_up';
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          dog_id: string;
          due_at: string;
          id?: string;
          notes?: string | null;
          recurrence?: 'custom' | 'daily' | 'monthly' | 'none' | 'weekly';
          related_medication_id?: string | null;
          remaining_count?: number | null;
          reminder_enabled?: boolean;
          title: string;
          type:
            | 'custom'
            | 'grooming'
            | 'medication_refill'
            | 'parasite_prevention'
            | 'training_practice'
            | 'vaccination'
            | 'vet_follow_up';
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          dog_id?: string;
          due_at?: string;
          id?: string;
          notes?: string | null;
          recurrence?: 'custom' | 'daily' | 'monthly' | 'none' | 'weekly';
          related_medication_id?: string | null;
          remaining_count?: number | null;
          reminder_enabled?: boolean;
          title?: string;
          type?:
            | 'custom'
            | 'grooming'
            | 'medication_refill'
            | 'parasite_prevention'
            | 'training_practice'
            | 'vaccination'
            | 'vet_follow_up';
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'care_tasks_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['related_medication_id'];
            foreignKeyName: 'care_tasks_related_medication_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'medications';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'care_tasks_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      photo_baselines: {
        Row: {
          body_area: string | null;
          captured_at: string;
          category:
            | 'eyes'
            | 'grooming'
            | 'mobility_posture'
            | 'other'
            | 'skin'
            | 'stool'
            | 'teeth'
            | 'weight_shape'
            | 'wound';
          created_at: string | null;
          dog_id: string;
          id: string;
          notes: string | null;
          photo_uri: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          body_area?: string | null;
          captured_at: string;
          category:
            | 'eyes'
            | 'grooming'
            | 'mobility_posture'
            | 'other'
            | 'skin'
            | 'stool'
            | 'teeth'
            | 'weight_shape'
            | 'wound';
          created_at?: string | null;
          dog_id: string;
          id?: string;
          notes?: string | null;
          photo_uri?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          body_area?: string | null;
          captured_at?: string;
          category?:
            | 'eyes'
            | 'grooming'
            | 'mobility_posture'
            | 'other'
            | 'skin'
            | 'stool'
            | 'teeth'
            | 'weight_shape'
            | 'wound';
          created_at?: string | null;
          dog_id?: string;
          id?: string;
          notes?: string | null;
          photo_uri?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'photo_baselines_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'photo_baselines_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      events: {
        Row: {
          created_at: string | null;
          details: Json | null;
          dog_id: string;
          id: string;
          logged_at: string | null;
          notes: string | null;
          occurred_at: string;
          photo_url: string | null;
          synced: boolean | null;
          type:
            | 'appetite'
            | 'behavior'
            | 'cough_sneeze'
            | 'dental'
            | 'grooming'
            | 'meal'
            | 'medication'
            | 'mood'
            | 'mobility'
            | 'note'
            | 'parasite_prevention'
            | 'pee'
            | 'poop'
            | 'rest'
            | 'symptom'
            | 'training'
            | 'vet_visit'
            | 'vomit'
            | 'walk'
            | 'water'
            | 'weight';
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          details?: Json | null;
          dog_id: string;
          id?: string;
          logged_at?: string | null;
          notes?: string | null;
          occurred_at: string;
          photo_url?: string | null;
          synced?: boolean | null;
          type:
            | 'appetite'
            | 'behavior'
            | 'cough_sneeze'
            | 'dental'
            | 'grooming'
            | 'meal'
            | 'medication'
            | 'mood'
            | 'mobility'
            | 'note'
            | 'parasite_prevention'
            | 'pee'
            | 'poop'
            | 'rest'
            | 'symptom'
            | 'training'
            | 'vet_visit'
            | 'vomit'
            | 'walk'
            | 'water'
            | 'weight';
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          details?: Json | null;
          dog_id?: string;
          id?: string;
          logged_at?: string | null;
          notes?: string | null;
          occurred_at?: string;
          photo_url?: string | null;
          synced?: boolean | null;
          type?:
            | 'appetite'
            | 'behavior'
            | 'cough_sneeze'
            | 'dental'
            | 'grooming'
            | 'meal'
            | 'medication'
            | 'mood'
            | 'mobility'
            | 'note'
            | 'parasite_prevention'
            | 'pee'
            | 'poop'
            | 'rest'
            | 'symptom'
            | 'training'
            | 'vet_visit'
            | 'vomit'
            | 'walk'
            | 'water'
            | 'weight';
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'events_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'events_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category:
            | 'boarding'
            | 'food'
            | 'grooming'
            | 'insurance'
            | 'medication'
            | 'other'
            | 'toys'
            | 'vet';
          created_at: string | null;
          date: string;
          description: string | null;
          dog_id: string;
          id: string;
          receipt_photo_url: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category:
            | 'boarding'
            | 'food'
            | 'grooming'
            | 'insurance'
            | 'medication'
            | 'other'
            | 'toys'
            | 'vet';
          created_at?: string | null;
          date: string;
          description?: string | null;
          dog_id: string;
          id?: string;
          receipt_photo_url?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?:
            | 'boarding'
            | 'food'
            | 'grooming'
            | 'insurance'
            | 'medication'
            | 'other'
            | 'toys'
            | 'vet';
          created_at?: string | null;
          date?: string;
          description?: string | null;
          dog_id?: string;
          id?: string;
          receipt_photo_url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'expenses_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'expenses_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      care_handoffs: {
        Row: {
          author_user_id: string;
          created_at: string | null;
          dog_id: string;
          ends_at: string | null;
          household_id: string;
          id: string;
          note: string;
          starts_at: string | null;
          status: 'open' | 'resolved';
          updated_at: string | null;
        };
        Insert: {
          author_user_id: string;
          created_at?: string | null;
          dog_id: string;
          ends_at?: string | null;
          household_id: string;
          id?: string;
          note: string;
          starts_at?: string | null;
          status?: 'open' | 'resolved';
          updated_at?: string | null;
        };
        Update: {
          author_user_id?: string;
          created_at?: string | null;
          dog_id?: string;
          ends_at?: string | null;
          household_id?: string;
          id?: string;
          note?: string;
          starts_at?: string | null;
          status?: 'open' | 'resolved';
          updated_at?: string | null;
        };
        Relationships: [
          {
            columns: ['author_user_id'];
            foreignKeyName: 'care_handoffs_author_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
          {
            columns: ['dog_id'];
            foreignKeyName: 'care_handoffs_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['household_id'];
            foreignKeyName: 'care_handoffs_household_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'households';
          },
        ];
      };
      insights: {
        Row: {
          content: string;
          dog_id: string;
          generated_at: string | null;
          id: string;
          prompt_version: string | null;
          week_start: string;
        };
        Insert: {
          content: string;
          dog_id: string;
          generated_at?: string | null;
          id?: string;
          prompt_version?: string | null;
          week_start: string;
        };
        Update: {
          content?: string;
          dog_id?: string;
          generated_at?: string | null;
          id?: string;
          prompt_version?: string | null;
          week_start?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'insights_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
        ];
      };
      household_dogs: {
        Row: {
          added_by_user_id: string | null;
          created_at: string | null;
          dog_id: string;
          household_id: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          added_by_user_id?: string | null;
          created_at?: string | null;
          dog_id: string;
          household_id: string;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          added_by_user_id?: string | null;
          created_at?: string | null;
          dog_id?: string;
          household_id?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            columns: ['added_by_user_id'];
            foreignKeyName: 'household_dogs_added_by_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
          {
            columns: ['dog_id'];
            foreignKeyName: 'household_dogs_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['household_id'];
            foreignKeyName: 'household_dogs_household_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'households';
          },
        ];
      };
      household_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string | null;
          dog_ids: Json;
          email: string;
          expires_at: string;
          household_id: string;
          id: string;
          inviter_user_id: string;
          permissions: Json;
          revoked_at: string | null;
          role: 'caregiver' | 'sitter' | 'viewer';
          token_hash: string;
          updated_at: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string | null;
          dog_ids?: Json;
          email: string;
          expires_at: string;
          household_id: string;
          id?: string;
          inviter_user_id: string;
          permissions?: Json;
          revoked_at?: string | null;
          role: 'caregiver' | 'sitter' | 'viewer';
          token_hash: string;
          updated_at?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string | null;
          dog_ids?: Json;
          email?: string;
          expires_at?: string;
          household_id?: string;
          id?: string;
          inviter_user_id?: string;
          permissions?: Json;
          revoked_at?: string | null;
          role?: 'caregiver' | 'sitter' | 'viewer';
          token_hash?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            columns: ['household_id'];
            foreignKeyName: 'household_invites_household_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'households';
          },
          {
            columns: ['inviter_user_id'];
            foreignKeyName: 'household_invites_inviter_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      household_members: {
        Row: {
          allowed_dog_ids: Json;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          household_id: string;
          id: string;
          invited_by_user_id: string | null;
          permissions: Json;
          role: 'caregiver' | 'owner' | 'sitter' | 'viewer';
          sitter_expires_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          allowed_dog_ids?: Json;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          household_id: string;
          id?: string;
          invited_by_user_id?: string | null;
          permissions?: Json;
          role: 'caregiver' | 'owner' | 'sitter' | 'viewer';
          sitter_expires_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          allowed_dog_ids?: Json;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          household_id?: string;
          id?: string;
          invited_by_user_id?: string | null;
          permissions?: Json;
          role?: 'caregiver' | 'owner' | 'sitter' | 'viewer';
          sitter_expires_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['household_id'];
            foreignKeyName: 'household_members_household_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'households';
          },
          {
            columns: ['invited_by_user_id'];
            foreignKeyName: 'household_members_invited_by_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'household_members_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      households: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner_user_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          owner_user_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner_user_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            columns: ['owner_user_id'];
            foreignKeyName: 'households_owner_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      medications: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          dog_id: string;
          dose_mg: number | null;
          end_date: string | null;
          frequency:
            | 'as_needed'
            | 'daily'
            | 'every_other_day'
            | 'twice_daily'
            | 'weekly'
            | null;
          give_with_food: boolean | null;
          id: string;
          name: string;
          notes: string | null;
          refill_date: string | null;
          schedule_times: Json | null;
          start_date: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          dog_id: string;
          dose_mg?: number | null;
          end_date?: string | null;
          frequency?:
            | 'as_needed'
            | 'daily'
            | 'every_other_day'
            | 'twice_daily'
            | 'weekly'
            | null;
          give_with_food?: boolean | null;
          id?: string;
          name: string;
          notes?: string | null;
          refill_date?: string | null;
          schedule_times?: Json | null;
          start_date?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          dog_id?: string;
          dose_mg?: number | null;
          end_date?: string | null;
          frequency?:
            | 'as_needed'
            | 'daily'
            | 'every_other_day'
            | 'twice_daily'
            | 'weekly'
            | null;
          give_with_food?: boolean | null;
          id?: string;
          name?: string;
          notes?: string | null;
          refill_date?: string | null;
          schedule_times?: Json | null;
          start_date?: string | null;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'medications_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
        ];
      };
      training_programs: {
        Row: {
          category:
            | 'behavior_modification'
            | 'leash_skills'
            | 'obedience'
            | 'puppy_basics'
            | 'socialization'
            | 'tricks';
          created_at: string | null;
          description: string | null;
          difficulty: 'advanced' | 'beginner' | 'intermediate';
          estimated_days: number;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          category:
            | 'behavior_modification'
            | 'leash_skills'
            | 'obedience'
            | 'puppy_basics'
            | 'socialization'
            | 'tricks';
          created_at?: string | null;
          description?: string | null;
          difficulty: 'advanced' | 'beginner' | 'intermediate';
          estimated_days: number;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number | null;
        };
        Update: {
          category?:
            | 'behavior_modification'
            | 'leash_skills'
            | 'obedience'
            | 'puppy_basics'
            | 'socialization'
            | 'tricks';
          created_at?: string | null;
          description?: string | null;
          difficulty?: 'advanced' | 'beginner' | 'intermediate';
          estimated_days?: number;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      training_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          dog_id: string;
          dog_mood:
            | 'anxious'
            | 'calm'
            | 'clingy'
            | 'happy'
            | 'hyper'
            | 'lethargic'
            | 'off'
            | null;
          duration_min: number | null;
          enrollment_id: string;
          id: string;
          notes: string | null;
          step_id: string;
          success_rating: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          dog_id: string;
          dog_mood?:
            | 'anxious'
            | 'calm'
            | 'clingy'
            | 'happy'
            | 'hyper'
            | 'lethargic'
            | 'off'
            | null;
          duration_min?: number | null;
          enrollment_id: string;
          id?: string;
          notes?: string | null;
          step_id: string;
          success_rating?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          dog_id?: string;
          dog_mood?:
            | 'anxious'
            | 'calm'
            | 'clingy'
            | 'happy'
            | 'hyper'
            | 'lethargic'
            | 'off'
            | null;
          duration_min?: number | null;
          enrollment_id?: string;
          id?: string;
          notes?: string | null;
          step_id?: string;
          success_rating?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'training_sessions_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['enrollment_id'];
            foreignKeyName: 'training_sessions_enrollment_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dog_training_enrollments';
          },
          {
            columns: ['step_id'];
            foreignKeyName: 'training_sessions_step_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'training_steps';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'training_sessions_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      training_steps: {
        Row: {
          created_at: string | null;
          estimated_duration_min: number | null;
          id: string;
          instruction: string;
          program_id: string;
          step_number: number;
          tip: string | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          estimated_duration_min?: number | null;
          id?: string;
          instruction: string;
          program_id: string;
          step_number: number;
          tip?: string | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          estimated_duration_min?: number | null;
          id?: string;
          instruction?: string;
          program_id?: string;
          step_number?: number;
          tip?: string | null;
          title?: string;
        };
        Relationships: [
          {
            columns: ['program_id'];
            foreignKeyName: 'training_steps_program_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'training_programs';
          },
        ];
      };
      vet_share_links: {
        Row: {
          created_at: string | null;
          dog_id: string;
          expires_at: string;
          id: string;
          range_end: string;
          range_start: string;
          report_snapshot: Json;
          revoked_at: string | null;
          token_hash: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          dog_id: string;
          expires_at: string;
          id?: string;
          range_end: string;
          range_start: string;
          report_snapshot?: Json;
          revoked_at?: string | null;
          token_hash: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          dog_id?: string;
          expires_at?: string;
          id?: string;
          range_end?: string;
          range_start?: string;
          report_snapshot?: Json;
          revoked_at?: string | null;
          token_hash?: string;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'vet_share_links_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
          {
            columns: ['user_id'];
            foreignKeyName: 'vet_share_links_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      user_contact_preferences: {
        Row: {
          consent_source: string;
          contact_value: string | null;
          created_at: string | null;
          marketing_contact_consent: boolean;
          marketing_consented_at: string | null;
          preferred_contact_channel:
            | 'email'
            | 'other'
            | 'signal'
            | 'sms'
            | 'telegram'
            | 'whatsapp'
            | null;
          preferred_name: string | null;
          primary_goal:
            | 'health_patterns'
            | 'medications'
            | 'multi_caregiver'
            | 'other'
            | 'training'
            | 'vet_prep'
            | null;
          skipped_at: string | null;
          support_contact_consent: boolean;
          support_consented_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          consent_source?: string;
          contact_value?: string | null;
          created_at?: string | null;
          marketing_contact_consent?: boolean;
          marketing_consented_at?: string | null;
          preferred_contact_channel?:
            | 'email'
            | 'other'
            | 'signal'
            | 'sms'
            | 'telegram'
            | 'whatsapp'
            | null;
          preferred_name?: string | null;
          primary_goal?:
            | 'health_patterns'
            | 'medications'
            | 'multi_caregiver'
            | 'other'
            | 'training'
            | 'vet_prep'
            | null;
          skipped_at?: string | null;
          support_contact_consent?: boolean;
          support_consented_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          consent_source?: string;
          contact_value?: string | null;
          created_at?: string | null;
          marketing_contact_consent?: boolean;
          marketing_consented_at?: string | null;
          preferred_contact_channel?:
            | 'email'
            | 'other'
            | 'signal'
            | 'sms'
            | 'telegram'
            | 'whatsapp'
            | null;
          preferred_name?: string | null;
          primary_goal?:
            | 'health_patterns'
            | 'medications'
            | 'multi_caregiver'
            | 'other'
            | 'training'
            | 'vet_prep'
            | null;
          skipped_at?: string | null;
          support_contact_consent?: boolean;
          support_consented_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'user_contact_preferences_user_id_fkey';
            isOneToOne: true;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          revenuecat_user_id: string | null;
          subscription_tier:
            | 'active'
            | 'expired'
            | 'grandfathered'
            | 'trial'
            | null;
          trial_ends_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          revenuecat_user_id?: string | null;
          subscription_tier?:
            | 'active'
            | 'expired'
            | 'grandfathered'
            | 'trial'
            | null;
          trial_ends_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          revenuecat_user_id?: string | null;
          subscription_tier?:
            | 'active'
            | 'expired'
            | 'grandfathered'
            | 'trial'
            | null;
          trial_ends_at?: string | null;
        };
        Relationships: [];
      };
      vaccinations: {
        Row: {
          created_at: string | null;
          date_given: string | null;
          dog_id: string;
          id: string;
          name: string;
          next_due: string | null;
          notes: string | null;
          record_photo_url: string | null;
          vet_name: string | null;
        };
        Insert: {
          created_at?: string | null;
          date_given?: string | null;
          dog_id: string;
          id?: string;
          name: string;
          next_due?: string | null;
          notes?: string | null;
          record_photo_url?: string | null;
          vet_name?: string | null;
        };
        Update: {
          created_at?: string | null;
          date_given?: string | null;
          dog_id?: string;
          id?: string;
          name?: string;
          next_due?: string | null;
          notes?: string | null;
          record_photo_url?: string | null;
          vet_name?: string | null;
        };
        Relationships: [
          {
            columns: ['dog_id'];
            foreignKeyName: 'vaccinations_dog_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'dogs';
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_owns_dog: {
        Args: {
          target_dog_id: string;
        };
        Returns: boolean;
      };
      current_user_has_premium_access: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_can_create_shared_dog_log: {
        Args: {
          target_dog_id: string;
        };
        Returns: boolean;
      };
      current_user_can_manage_shared_dog_records: {
        Args: {
          target_dog_id: string;
        };
        Returns: boolean;
      };
      current_user_can_view_shared_dog: {
        Args: {
          target_dog_id: string;
        };
        Returns: boolean;
      };
      current_user_has_household_permission: {
        Args: {
          requested_permission: string;
          target_household_id: string;
        };
        Returns: boolean;
      };
      current_user_has_household_role: {
        Args: {
          allowed_roles: string[];
          target_household_id: string;
        };
        Returns: boolean;
      };
      is_storage_owner: {
        Args: {
          object_name: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
