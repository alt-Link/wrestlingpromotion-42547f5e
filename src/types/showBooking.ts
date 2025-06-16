
export interface Match {
  id: string;
  type: string;
  participants: string[];
  result?: string;
  notes?: string;
  championship?: string;
  stipulation?: string;
}

export interface Show {
  id?: string;
  name: string;
  brand: string;
  date?: string;
  frequency: string;
  venue: string;
  description: string;
  matches: Match[];
  is_template?: boolean;
  instance_date?: string;
}

export const MATCH_TYPES = [
  "Singles Match",
  "Tag Team Match",
  "Triple Threat Match",
  "Fatal 4-Way",
  "Battle Royal",
  "Royal Rumble",
  "Ladder Match",
  "Tables Match",
  "Chairs Match",
  "TLC Match",
  "Hell in a Cell",
  "Steel Cage Match",
  "Last Man Standing",
  "I Quit Match",
  "Submission Match",
  "No Disqualification",
  "Street Fight",
  "Hardcore Match"
];
