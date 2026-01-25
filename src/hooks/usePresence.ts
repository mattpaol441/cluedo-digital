// usePresence: hook per tracciare stato online/offline dell'utente corrente

// Responsabilità:
// - Imposta l'utente come online all'avvio
// - Invia heartbeat ogni 5 minuti per mantenere lo stato "online" aggiornato
// - Tenta di impostare offline alla chiusura del browser (best effort)
// Chi lo usa: RootLayout.tsx (viene chiamato una sola volta per tutta l'app)

// SISTEMA HEARTBEAT:
// Il sistema usa lastSeen per determinare se un utente è online.
// Un utente è considerato "online" se lastSeen < 10 minuti fa.
// Questo risolve il problema dei browser chiusi senza logout esplicito.

import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import {
    setUserOnline,
    setUserOffline,
    updateUserPresence,
    HEARTBEAT_INTERVAL_MS
} from '../firebase/presence';

export function usePresence() {
    const user = useAppSelector((state) => state.user);
    const hasSetOnline = useRef(false);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user.uid || !user.isLoggedIn) return;

        // Imposta online e avvia heartbeat
        const goOnline = async () => {
            if (!hasSetOnline.current) {
                await setUserOnline(user.uid);
                hasSetOnline.current = true;

                // Avvia heartbeat: aggiorna lastSeen ogni 5 minuti
                heartbeatIntervalRef.current = setInterval(async () => {
                    try {
                        await updateUserPresence(user.uid);
                    } catch (error) {
                        console.error('[PRESENCE] Errore heartbeat:', error);
                    }
                }, HEARTBEAT_INTERVAL_MS);

                console.log('[PRESENCE] Heartbeat avviato');
            }
        };

        // Imposta offline e ferma heartbeat
        const goOffline = async () => {
            // Ferma il heartbeat
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
                console.log('[PRESENCE] Heartbeat fermato');
            }

            if (hasSetOnline.current) {
                await setUserOffline(user.uid);
                hasSetOnline.current = false;
            }
        };

        // Vai online all'avvio
        goOnline();

        // Handler per chiusura tab/finestra
        // Nota: questo è "best effort" - potrebbe non funzionare sempre
        // Ma grazie al sistema heartbeat, l'utente verrà comunque mostrato
        // offline dopo 10 minuti di inattività
        const handleBeforeUnload = () => {
            goOffline();
        };

        // NOTA: NON usiamo visibilitychange perché vogliamo che l'utente
        // rimanga online anche quando la tab non è in primo piano.
        // Il heartbeat continua a funzionare anche con tab in background.

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            goOffline();
        };
    }, [user.uid, user.isLoggedIn]);
}

export default usePresence;

