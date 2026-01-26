// useTurnTimer: hook per gestire il countdown del timer di turno/smentita
//
// Responsabilità:
// - Calcola i secondi rimanenti basandosi su startTime e timeout
// - Chiama onTimeout quando il tempo scade
// - Ritorna i secondi rimanenti per la visualizzazione
//
// NOTA: Il timer è gestito lato client. Ogni client calcola indipendentemente
// quando scade il tempo e chiama la mossa appropriata (surrender/skipRefutation).
// BoardGame.io risolverà eventuali conflitti se più client inviano la stessa mossa.

import { useEffect, useState, useRef, useCallback } from 'react';

// Costanti di timeout (in millisecondi)
export const TURN_TIMEOUT_MS = 90 * 1000;      // 90 secondi per il turno
export const REFUTATION_TIMEOUT_MS = 30 * 1000; // 30 secondi per la smentita

interface UseTurnTimerOptions {
    startTime: number | undefined;  // Timestamp di inizio (da G.turnStartedAt o G.stageStartedAt)
    timeoutMs: number;              // Durata timeout in ms
    onTimeout: () => void;          // Callback quando scade
    enabled?: boolean;              // Se false, il timer non fa nulla
}

interface UseTurnTimerResult {
    remainingSeconds: number;       // Secondi rimanenti (per UI)
    isExpired: boolean;             // true se il tempo è scaduto
}

export function useTurnTimer({
    startTime,
    timeoutMs,
    onTimeout,
    enabled = true
}: UseTurnTimerOptions): UseTurnTimerResult {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(Math.ceil(timeoutMs / 1000));
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const hasCalledTimeout = useRef<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Callback stabile per onTimeout
    const onTimeoutRef = useRef(onTimeout);
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    // Funzione per calcolare i secondi rimanenti
    const calculateRemaining = useCallback(() => {
        if (!startTime) return Math.ceil(timeoutMs / 1000);

        const elapsed = Date.now() - startTime;
        const remaining = timeoutMs - elapsed;
        return Math.max(0, Math.ceil(remaining / 1000));
    }, [startTime, timeoutMs]);

    useEffect(() => {
        // Reset quando cambia startTime
        hasCalledTimeout.current = false;
        setIsExpired(false);
        setRemainingSeconds(calculateRemaining());

        // Se non abilitato o nessun startTime, non fare nulla
        if (!enabled || !startTime) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Aggiorna ogni secondo
        intervalRef.current = setInterval(() => {
            const remaining = calculateRemaining();
            setRemainingSeconds(remaining);

            if (remaining <= 0 && !hasCalledTimeout.current) {
                hasCalledTimeout.current = true;
                setIsExpired(true);
                console.log('[TIMER] Tempo scaduto!');
                onTimeoutRef.current();
            }
        }, 1000);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [startTime, timeoutMs, enabled, calculateRemaining]);

    return { remainingSeconds, isExpired };
}

export default useTurnTimer;
