// Shared TypeScript types for the WedLink Worker

export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  ADMIN_USERNAME?: string;
  API_BASE_URL?: string;
  ENVIRONMENT?: string;
}

// Context variables set by the auth middleware
export type AppVariables = {
  userId: number;
  username: string;
};

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Session {
  token: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface Invitation {
  id: number;
  user_id: number;
  slug: string;
  bride: string;
  groom: string;
  date: string;
  time: string | null;
  venue: string;
  message: string | null;
  image_url: string | null;
  theme: string;
  layout?: string; // Fallback for old data
  desktop_layout?: string;
  mobile_layout?: string;
  created_at: string;
}

export interface Rsvp {
  id: number;
  invitation_id: number;
  guest_name: string;
  attending: number; // 1 = yes, 0 = no
  message: string | null;
  created_at: string;
}

export interface CreateInvitationBody {
  slug?: string;
  bride: string;
  groom: string;
  date: string;
  time?: string;
  venue: string;
  message?: string;
  image_url?: string;
  theme?: string;
  desktop_layout?: string;
  mobile_layout?: string;
}

export interface CreateRsvpBody {
  guest_name: string;
  attending: boolean;
  message?: string;
}
