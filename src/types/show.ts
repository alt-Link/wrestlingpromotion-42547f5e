
export interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
  matches: Match[];
  isTemplate?: boolean;
  baseShowId?: string;
  instanceDate?: Date;
}

export interface Match {
  id: string;
  type: string;
  participants: string[];
  result?: string;
  notes?: string;
  titleMatch?: boolean;
  championship?: string;
}
