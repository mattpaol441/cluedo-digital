// React Custom Hook per gestire il Taccuino del Giocatore, separando la logica dalla grafica 
// Si occupa solo di gestire la memoria del taccuino
import { useState, useEffect, useCallback } from "react";
// Importiamo il tipo definitivo per il taccuino in types.ts
import type { NotebookState } from "@cluedo-digital/shared"; 

// NOTE sul perchè uso matchID e myPlayerID:
// Vogliamo che il taccuino sia PRIVATO per ogni giocatore e per ogni partita.
// Quindi, se due giocatori giocano la stessa partita, avranno due taccuini diversi.
// Se lo stesso giocatore gioca due partite diverse (non contemporanemanete si intende), avrà due taccuini diversi (uno per partita).
// Per fare questo, usiamo una chiave di salvataggio (STORAGE_KEY) che combina entrambi gli ID.

// NOTE sul perchè uso il browser localStorage:
// Segretezza: Il taccuino è uno strumento personale del giocatore per prendere appunti. Non deve essere mai condiviso con altri giocatori o salvato sul server di gioco, per evitare qualsiasi rischio di fuga di informazioni.
// Se usassimo il Server ogni click sarebbe una mossa. Il server dovrebbe gestire ogni singola X come una mossa di gioco, con conseguente aumento del carico di rete e latenza, e memorizzando lo stato del taccuino per ogni giocatore aumentando la complessità.
// Usando il Browser, lo stato del gioco ($G) rimane puro. Il taccuino non influisce sulle regole del gioco, quindi non deve essere parte dello stato di gioco sincronizzato.
// se un giocatore ricarica la pagina non perde i dati perché lo salviamo nel localStorage del browser, che persiste tra le sessioni di navigazione.

export function useNotebook(matchID: string, myPlayerID: string) {  // fatto così per avere una chiave unica per partita+giocatore, quindi un taccuino privato, che appartiene a UN giocatore dentro UNA partita
  // L'etichetta che usiamo per salvare i dati nel browser (localStorage) 
  // La chiave è UNICA per quella partita e per quel giocatore
  const STORAGE_KEY = `cluedo-notebook-${matchID}-${myPlayerID}`;

  // 1. Inizializzazione dello Stato (Legge da LocalStorage)
  // Invece di scrivere useState({}), uso una funzione lazy per evitare di leggere da localStorage ad ogni render (legge solo una volta all'avvio dell'app)
  // Altrimenti leggerebbe il localStorage (operazione lenta) ogni singola volta che il componente viene ridisegnato (render), anche se il dato non serve più perché lo abbiamo già in memoria
  const [notebook, setNotebook] = useState<NotebookState>(() => { // Etuchetta che istruisce TypeScript del fatto che la variabile notebook è destinata a contenere un oggetto di tipo NotebookState (cioè un dizionario di stringhe e booleani)
    // Controllo per evitare errori se siamo lato server (Next.js/SSR)
    if (typeof window !== "undefined") { // Il codice typeof window !== "undefined" protegge da crash di tipo runtime su ambienti server-side (anche se usiamo Vite, è una best practice di robustezza)
      // Provo a leggere i dati salvati. Il taccuino NON è vuoto quando l'utente ricarica la pagina o riapre il browser dopo averlo chiuso, e aveva precedentemente messo delle X
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Errore caricamento taccuino", e);
        }
      }
    }
    return {}; // Altrimenti parte vuoto
  });

  // 2. Salvataggio automatico ad ogni modifica
  // Ogni volta che si mette/toglie una X, questa funzione parte e sovrascrive i dati nel browser (setItem) 
  // trasformando l'oggetto in stringa (JSON.stringify)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook));
    }
  }, [notebook]); //[notebook] dice a React "tieni d'occhio la variabile notebook"
  

  // 3. Funzione Toggle semplificata
  // basta l'ID della carta
  const toggleNote = useCallback((cardID: string) => {
    setNotebook((prev) => {
      const newState = { ...prev }; // Copia lo stato precedente evitando di modificare i dati originali
      if (newState[cardID]) {
        delete newState[cardID]; // Se c'era, la toglie (torna vuoto)
      } else {
        newState[cardID] = true; // Se non c'era, mette la X
      }
      return newState;
    });
  }, []);

  // 4. Funzione di pulizia totale
  const clearNotebook = useCallback(() => {
    setNotebook({});
  }, []);

  return { notebook, toggleNote, clearNotebook };
}