export type SuspectID = 'mustard' | 'plum' | 'green' | 'peacock' | 'scarlet' | 'orchid';

export type RoomID =  'ballroom' | 'billiard_room' | 'conservatory' | 'dining_room' | 'hall' | 'kitchen' | 'library' | 'lounge' | 'study';

export type WeaponID = 'candlestick' | 'dagger' | 'lead_pipe' | 'revolver' | 'rope' | 'wrench';

export interface SuspectCard {
    type: 'SUSPECT';
    id: SuspectID;
    name: string;
    image?: string;
}

export interface WeaponCard {
    type: 'WEAPON';
    id: WeaponID;
    name: string;
    image?: string;
}

export interface RoomCard {
    type: 'ROOM';
    id: RoomID;
    name: string;
    image?: string;
}

export type Card = SuspectCard | WeaponCard | RoomCard;


export type CardType = Card['type'];