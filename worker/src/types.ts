// Shared TypeScript types for the WedLink Worker

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

export interface Invitation {
  id: number;
  slug: string;
  bride: string;
  groom: string;
  date: string;
  venue: string;
  message: string | null;
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
  bride: string;
  groom: string;
  date: string;
  venue: string;
  message?: string;
}

export interface CreateRsvpBody {
  guest_name: string;
  attending: boolean;
  message?: string;
}
