import type { Card, SuspectCard, WeaponCard, RoomCard, SuspectID } from '../types/models.js';

// --- 1. LISTE CARTE (Source of Truth) ---

export const SUSPECTS: SuspectCard[] = [
  { id: 'scarlet',  name: 'Miss Scarlet',       type: 'SUSPECT' },
  { id: 'orchid',   name: 'Dottoressa Orchid',  type: 'SUSPECT' },
  { id: 'peacock',  name: 'Contessa Peacock',   type: 'SUSPECT' },
  { id: 'plum',     name: 'Professor Plum',     type: 'SUSPECT' },
  { id: 'mustard',  name: 'Colonnello Mustard', type: 'SUSPECT' }, 
  { id: 'green',    name: 'Reverendo Green',    type: 'SUSPECT' },
];

export const WEAPONS: WeaponCard[] = [
  { id: 'candlestick', name: 'Candeliere',      type: 'WEAPON' },
  { id: 'dagger',      name: 'Pugnale',         type: 'WEAPON' },
  { id: 'lead_pipe',   name: 'Tubo di piombo',  type: 'WEAPON' },
  { id: 'revolver',    name: 'Pistola',         type: 'WEAPON' },
  { id: 'rope',        name: 'Corda',           type: 'WEAPON' },
  { id: 'wrench',      name: 'Chiave inglese',  type: 'WEAPON' },
];

export const ROOMS: RoomCard[] = [
  { id: 'ballroom',      name: 'Sala da ballo',    type: 'ROOM' },
  { id: 'billiard_room', name: 'Sala da biliardo', type: 'ROOM' },
  { id: 'conservatory',  name: 'Serra',            type: 'ROOM' },
  { id: 'dining_room',   name: 'Sala da pranzo',   type: 'ROOM' },
  { id: 'hall',          name: 'Ingresso',         type: 'ROOM' },
  { id: 'kitchen',       name: 'Cucina',           type: 'ROOM' },
  { id: 'library',       name: 'Biblioteca',       type: 'ROOM' },
  { id: 'lounge',        name: 'Salotto',          type: 'ROOM' },
  { id: 'study',         name: 'Studio',           type: 'ROOM' },
];

// Unito tutto per facilità di accesso
export const ALL_CARDS: Card[] = [...SUSPECTS, ...WEAPONS, ...ROOMS];

// UTILITY FUNCTIONS PER VISUALIZZARE I NOMI
// è indispensabile perché in models.ts usiamo solo gli ID per riferirci alle carte, quindi per mostrare il nome dobbiamo fare lookup qui
// tradotto: quando usiamo suspect, weapon, room (ad esempio in RefutationModal.tsx con currentSuggestion), che usano suspectID, weaponID, roomID definiti in models.ts, dobbiamo chiamare queste funzioni per ottenere il nome leggibile 
// es.: getSuspectName(suspectID) -> "Miss Scarlet"
// é corretto avere sia models.ts che constants.ts perché models.ts definisce i tipi e le strutture dati, mentre constants.ts fornisce/popola i dati concreti e le liste usate nell'applicazione
// anche ad esempio per cardId di matchingCards in SuggestionState in game.ts, usati in RefutationModal.tsx, dobbiamo usare getCardName(cardId) per mostrare il nome leggibile della carta, altrimenti nei vari passaggi l'info sul nome andrebbe persa
export const getSuspectName = (id: string): string => {
  return SUSPECTS.find(s => s.id === id)?.name ?? 'Unknown';
};

export const getWeaponName = (id: string): string => {
  return WEAPONS.find(w => w.id === id)?.name ?? 'Unknown';
};

export const getRoomName = (id: string): string => {
  return ROOMS.find(r => r.id === id)?.name ?? 'Unknown';
};

export const getCardName = (id: string): string => {
  const card = ALL_CARDS.find(c => c.id === id);
  return card?.name ?? 'Unknown';
};
 // Utility per ottenere l'intera carta da un ID, indispensabile per mostrare la carta perché in molti casi abbiamo solo l'ID (es. HypothesisModal), mentre GameCard (modale della carta) richiede l'intero oggetto carta
export const getCardById = (id: string): Card | undefined => {
  return ALL_CARDS.find(c => c.id === id);
};

// --- 2. CONFIGURAZIONE GIOCATORI ---

// Mappa per associare gli ID dei personaggi ai colori HEX
export const CHARACTER_COLORS: Record<SuspectID, string> = {
  scarlet:  '#FF2400', // Rosso Scarlatto
  peacock:  '#0000FF', // Blu Pavone
  plum:     '#8E4585', // Viola Prugna
  mustard:  '#FFDB58', // Giallo Senape
  orchid:   '#ffffffff', // Bianco Orchidea
  green:    '#008000', // Verde
};

// // Posizioni di partenza (Indici ipotetici della griglia 24x25)
// // Nota: Questi andranno affinati quando faremo la mappa esatta
// export const STARTING_POSITIONS: Record<SuspectID, number> = {
//   scarlet:  17,  // In alto a dx (esempio)
//   mustard:  490, // In basso a dx
//   orchid:   590, // In basso a sx
//   green:    580, // In basso a sx
//   peacock:  150, // A sinistra
//   plum:     50,  // A sinistra in alto
// };

// // --- 3. DATI DELLA GRIGLIA ---

// export const BOARD_WIDTH = 24;
// export const BOARD_HEIGHT = 25;

// // Qui in futuro metteremo l'array che definisce muri e stanze
// // Per ora lo lasciamo vuoto o mettiamo un placeholder
// export const MAP_LAYOUT: number[] = Array(BOARD_WIDTH * BOARD_HEIGHT).fill(0);



// // --- 4. GENERATORE MAPPA (ASCII ART) ---
// // Usiamo una rappresentazione visiva per definire muri e stanze.
// // Legenda:
// // # = Muro
// // . = Pavimento (Corridoio)
// // ! = Centro (Accusa Finale)
// // Numeri 1-9 = Porte che conducono alle stanze (vedi mappa porte sotto)
// // Lettere = Interno Stanze (solo visuale)

// const MAP_TEMPLATE = [
//   "########################",
//   "#KKKKK#...#BBBB#...#CCC#",
//   "#KKKKK..1.#BBBB#...#CCC#",
//   "#KKKKK#...#BBBB#...#CCC#",
//   "#KKKKK#...#BBBB#.2.#CCC#",
//   "##.3.##...##.4##...#5..#",
//   "........#............###",
//   "###...........##########",
//   "#DDDDD#.......#IIIIIIII#",
//   "#DDDDD#.......#IIIIIIII#",
//   "#DDDDD#.......6IIIIIIII#",
//   "#DDDDD#...!!!!!...#IIII#",
//   "#DDDDD#...!!!!!...#....#",
//   "##.7.##...!!!!!...##.8##",
//   "..........!!!!!........#",
//   "###.......!!!!!......###",
//   "#LLLLL#...!!!!!...#OOOO#",
//   "#LLLLL#...........9OOOO#",
//   "#LLLLL0...........#OOOO#",
//   "#LLLLL#...........#OOOO#",
//   "#######...........######",
//   "#SSSSS#...######...#####",
//   "#SSSSS#...#HHH1#...#####",
//   "#SSSSS#...#HHHH#...#####",
//   "########################"
// ];

// // Mappa delle Porte: Se atterri sul numero '1', vai in Cucina.
// const DOOR_MAPPING: Record<string, RoomID> = {
//   '1': 'kitchen',       // Porta Cucina
//   '2': 'ballroom',      // Porta Sala da Ballo (Sinistra)
//   '3': 'dining_room',   // Porta Sala da Pranzo (Alto)
//   '4': 'ballroom',      // Porta Sala da Ballo (Basso)
//   '5': 'conservatory',  // Porta Serra
//   '6': 'billiard_room', // Porta Biliardo
//   '7': 'dining_room',   // Porta Sala da Pranzo (Basso)
//   '8': 'library',       // Porta Biblioteca
//   '9': 'lounge',        // Porta Salotto
//   '0': 'library',       // Porta Biblioteca (Laterale)
//   // Nota: Nella mappa reale ne aggiungeremo altre per completezza
// };

// // Funzione che converte il Template ASCII nell'array di oggetti CellDefinition
// const buildMap = (): CellDefinition[] => {
//   const layout: CellDefinition[] = [];
  
//   // Uniamo le stringhe in un unico flusso di caratteri
//   const fullString = MAP_TEMPLATE.join('');

//   for (let i = 0; i < fullString.length; i++) {
//     const char = fullString[i];
    
//     // Default: Pavimento
//     let cell: CellDefinition = { type: 'FLOOR' };

//     if (char === '#') {
//       cell = { type: 'WALL' };
//     } else if (char === '!') {
//       cell = { type: 'CENTER' }; // La temuta stanza centrale
//     } else if (/[A-Z]/.test(char)) { // Lettere maiuscole = Interno Stanza
//        cell = { type: 'ROOM' }; // (Solo visuale, ci si muove tramite ID Stanza)
//     } else if (/[0-9]/.test(char)) { // Numeri = Porte
//       cell = { 
//         type: 'DOOR', 
//         doorTo: DOOR_MAPPING[char] 
//       };
//     }
    
//     layout.push(cell);
//   }
  
//   return layout;
// };

// // Esportiamo la mappa compilata (Array di 600 elementi)
// export const MAP_LAYOUT = buildMap();