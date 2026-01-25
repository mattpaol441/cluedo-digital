import { useEffect, useRef } from 'react';
import { updateUserStats, saveMatchToHistory  } from '../firebase/users';


// Hook che ascolta la fine della partita e aggiorna le statistiche su Firebase.
// Gestisce deduplicazione e persistenza tra refresh.

export function useGameStatsSync(
  matchID: string,
  gameover: any,             // ctx.gameover
  myPlayerID: string | null, // L'ID del giocatore corrente ("0", "1")
  myFirebaseUID: string | undefined, // L'UID reale (user_xyz) preso da G
  myCharacter: string | undefined, 
  winnerName: string | undefined 
) {
  const hasUpdated = useRef(false);

  useEffect(() => {
    // SE: La partita non è finita O non ho un UID reale O ho già aggiornato in questa sessione
    // ALLORA: Non fare nulla.
    if (!gameover || !myFirebaseUID || hasUpdated.current) {
      return;
    }

    // CHECK ANTI-REFRESH: Controlla se abbiamo già salvato su questo browser per questo matchID
    const storageKey = `cluedo_stats_saved_${matchID}`;
    if (localStorage.getItem(storageKey)) {
      console.log("[STATS] Statistiche già salvate in precedenza per questa partita.");
      return;
    }

    // CALCOLO RISULTATO
    const winnerID = gameover.winner;
    const didIWin = winnerID === myPlayerID;

    console.log(`[STATS] Partita conclusa. Aggiornamento stats per ${myFirebaseUID}...`);

    // BLOCCO LOCALE (Per evitare doppi invii immediati)
    hasUpdated.current = true;
    
    // BLOCCO PERSISTENTE (Per evitare doppi invii se ricarichi la pagina)
    localStorage.setItem(storageKey, 'true');

    // INVIO A FIREBASE
    updateUserStats(myFirebaseUID, didIWin)
      .then(() => console.log("[STATS] Statistiche aggiornate con successo su Firestore"))
      .catch((err) => {
        console.error("[STATS] Errore durante l'aggiornamento:", err);
        // Nota: Non rimuoviamo il lock dal localStorage per sicurezza,
        // meglio perdere una statistica che duplicarla all'infinito in caso di errori di rete.
      });

    // Salva la riga nella cronologia
    if (myCharacter && winnerName) {
        saveMatchToHistory(myFirebaseUID, {
            date: Date.now(),
            result: didIWin ? 'WIN' : 'LOSS',
            character: myCharacter,
            winner: winnerName
        }).then(() => console.log("[HISTORY] Partita aggiunta alla cronologia"));
    }

  }, [gameover, matchID, myPlayerID, myFirebaseUID, myCharacter, winnerName]);
}