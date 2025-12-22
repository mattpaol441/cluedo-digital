export const CellValues = {
    VOID: 0,
    HALL: 1,
    DOOR: 2,
    START: 3
} as const;  // 'as const' is a readonly assertion

// Type representing the possible cell values
// CellType can be 0, 1, 2, or 3
export type CellType = typeof CellValues[keyof typeof CellValues];

export type BoardMatrix = CellType[][];