import type { UserProfile } from './user';
import type { Wine } from './wine';

export interface CommunityPost {
  id: string;
  user_id: string;
  user?: UserProfile;
  wine_id?: string;
  wine?: Wine;
  content: string;
  rating?: number;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: string;
  image_url?: string;
  participants_count: number;
  created_at: string;
}
