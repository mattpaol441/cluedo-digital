import { BOARD_LAYOUT, CELL_TYPES } from "@cluedo-digital/shared";
import type { Player } from "@cluedo-digital/shared";

// Possible Directions
const DIRECTIONS = [
    { dx: 0, dy: -1 }, // Up
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 },  // Right
];

/**
 *  Calculate all valid cells from a starting point and a number of steps (dice roll
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate
 * @param steps Number of steps available (sum of dice)
 * @param players Current players on the board
 * @param currentPlayerId ID of the current player 
 * @returns String array of valid coordinates in "x,y" format
 */
export const getValidMoves = (
    startX: number, 
    startY: number, 
    steps: number, 
    players: Record<string, Player>,
    currentPlayerId: string
): string[] => {
    const validMoves = new Set<string>();
    const visited = new Set<string>();

    // BFS Queue: each item is {x, y, remainingSteps}
    const queue: { x: number; y: number; remainingSteps: number }[] = [
        { x: startX, y: startY, remainingSteps: steps }
    ];

    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
        const { x, y, remainingSteps } = queue.shift()!;

        // If no remaining steps, continue
        if (remainingSteps === 0) continue;

        // Explore all directions
        for (const { dx, dy } of DIRECTIONS) {
            const newX = x + dx;
            const newY = y + dy;
            const coordKey = `${newX},${newY}`;

            // -- CHEKS --
            // 1. Check bounds
            if (newY < 0 || newY >= BOARD_LAYOUT.length || newX < 0 || newX >= BOARD_LAYOUT[0].length) {
                continue;
            }

            // 2. Check if already visited
            if (visited.has(coordKey)) {
                continue;
            }

            // Recuperiamo il tipo di cella per i controlli successivi
            const cellType = BOARD_LAYOUT[newY][newX];

            // 3. Check walls
            if (cellType === CELL_TYPES.VOID) {
                continue;
            }

            // INIZIO MODIFICA: Logica Sovrapposizione 
            
            // Definiamo le zone dove la sovrapposizione è permessa (Porte e Centro)
            const isSafeZone = (
                cellType === CELL_TYPES.DOOR || 
                cellType === CELL_TYPES.CENTER
            );

            // 4. Check if cell is occupied by another player
            const isOccupied = Object.values(players).some(
                p => p.id !== currentPlayerId && p.position.x === newX && p.position.y === newY && !p.isEliminated
            );

            // Se la cella è occupata E NON siamo in una zona sicura (come una porta), allora blocchiamo.
            // Se invece è una porta (isSafeZone = true), il codice salta questo if e permette il passaggio.
            if (isOccupied && !isSafeZone) {
                continue;
            }

            // If all checks passed, add to valid moves
            visited.add(coordKey);
            queue.push({ x: newX, y: newY, remainingSteps: remainingSteps - 1 });
            validMoves.add(coordKey);
        }
    }

    return Array.from(validMoves);
};