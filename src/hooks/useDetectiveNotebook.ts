// React Custom Hook per gestire il Taccuino del Giocatore, separando la logica dalla grafica 
// Si occupa solo di gestire la memoria del taccuino
import { useState, useEffect, useCallback } from "react";
// Importiamo il nostro tipo definitivo per il taccuino in types.ts
import type { NotebookState } from "../game/types"; 

// L'etichetta che usiamo per salvare i dati nel browser (localStorage) 
// Così, se ricarichiamo la pagina, gli appunti non spariscono
const STORAGE_KEY = "cluedo-notebook-save-v1";

export function useNotebook() {
  // 1. Inizializzazione dello Stato (Legge da LocalStorage)
  // Invece di scrivere useState({}), usiamo una funzione lazy per evitare di leggere da localStorage ad ogni render (legge solo una volta all'avvio dell'app))
  const [notebook, setNotebook] = useState<NotebookState>(() => {
    // Controllo per evitare errori se siamo lato server (Next.js/SSR)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Errore caricamento taccuino", e);
        }
      }
    }
    return {}; // Parte vuoto
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