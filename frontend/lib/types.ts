export type Role = 'admin' | 'barber';
export type Gender = 'men' | 'women';

export interface Profile {
  id: string;
  role: Role;
  name: string;
  email: string;
  store_name?: string;
  phone?: string;
  created_at: string;
}

export interface Service {
  id: string;
  gender: Gender;
  name: string;
  icon: string;
  description: string;
  requires_photo: boolean;
  ai_prompt_template: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  gender: Gender | null;
  notes: string | null;
  created_at: string;
  last_visit: string | null;
  visit_count?: number;
}

export interface Suggestion {
  id: string;
  session_id: string;
  service_name: string;
  rank: number;
  style_name: string;
  description: string;
  compatibility_note: string;
  technique_tips: string;
  image_url?: string;
}

export interface Session {
  id: string;
  client_id: string;
  barber_id: string;
  gender: Gender;
  service_ids: string[];
  photo_url: string | null;
  description: string | null;
  selected_suggestion_id: string | null;
  status: string;
  created_at: string;
  client?: Client;
  suggestions?: Suggestion[];
}

export interface AnalyticsOverview {
  total_clients: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  returning_clients: number;
  new_clients: number;
}

export interface ConsultState {
  gender: Gender | null;
  client: Client | null;
  photoPreviews: string[];
  selectedServiceIds: string[];
  description: string;
  sessionId: string | null;
}

export interface Subscription {
  id: string;
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  barberLimit: number;
  aiLimit: number;
  createdAt: string;
}

export interface APIUsage {
  id: string;
  tokensUsed: number;
  apiCalls: number;
  dailyLimit: number;
  monthlyLimit: number;
  isBlocked: boolean;
  updatedAt: string;
}

export interface Salon {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  subscription?: Subscription;
  apiUsage?: APIUsage;
}
