export type TournamentStatus = 'active' | 'upcoming' | 'completed';

export interface Tournament {
  id: string;
  title: string;
  game: string;
  posterUrl: string;
  date: string;
  time?: string;
  prizePool: string;
  format: string;
  description: string;
  formUrl: string;
  status: TournamentStatus;
  platform?: string;
  entryFee?: string;
  registeredTeams?: number;
  maxTeams?: number;
  isSpotlight?: boolean;
}

export interface HeroSpotlight {
  id?: string;
  badge: string;       // e.g. "REGISTRATION LIVE"
  title: string;       // e.g. "Valorant: Clash of Radiants"
  prize: string;       // e.g. "₹10,000"
  subtitle: string;    // e.g. "5v5 Inter-College"
  formUrl: string;     // Google Form link
  isActive: boolean;
}
