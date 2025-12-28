import { RoomID, SuspectID } from "./types";

export const CellValues = {
    VOID: 0,
    HALL: 1,
    DOOR: 2,
    START: 3,
    CENTER: 4,
} as const;  // 'as const' is a read-only assertion

// Type representing the possible cell values
// CellType can be 0, 1, 2, or 3
export type CellType = typeof CellValues[keyof typeof CellValues];

export type BoardMatrix = CellType[][];

export interface CellDefinition {
    x: number;
    y: number;
    type: CellType;
    doorTo?: RoomID;
    startForSuspect?: SuspectID;
    onClick: (x: number, y: number) => void;
    children?: React.ReactNode;
    isHighlighted?: boolean;
}
export interface Coordinate {
    x: number;
    y: number;
}