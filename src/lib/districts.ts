// Communes et quartiers de la province de Nouaceur
export const DISTRICTS = [
  "Nouaceur (centre)",
  "Dar Bouazza",
  "Bouskoura",
  "Ouled Saleh",
  "Ouled Azzouz",
  "Lahraouiyine",
  "Médiouna",
  "Aéroport Mohammed V",
  "Autre",
] as const;

export type District = (typeof DISTRICTS)[number];

// Centre approximatif de la province de Nouaceur
export const NOUACEUR_CENTER: [number, number] = [33.3683, -7.5683];
export const NOUACEUR_ZOOM = 12;
