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
}
