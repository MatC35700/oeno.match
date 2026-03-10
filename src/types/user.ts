export type ExperienceLevel =
  | 'beginner'
  | 'amateur'
  | 'confirmed'
  | 'expert'
  | 'master_sommelier';

export type UserGoal =
  | 'pairing'
  | 'cellar'
  | 'tasting'
  | 'tasting_advice'
  | 'buying_tips';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  avatar_url?: string;
  preferred_language: string;
  age?: number;
  favorite_regions?: string[];
  experience_level?: ExperienceLevel;
  goals?: UserGoal[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
