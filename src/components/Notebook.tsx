// Importiamo il custom hook per gestire il taccuino
import { useNotebook } from '../hooks/useDetectiveNotebook';
// Importiamo i dati costanti definiti in constants.ts
import { SUSPECTS, WEAPONS, ROOMS } from "@cluedo-digital/shared";
import type { Card } from "@cluedo-digital/shared";
import { X } from 'lucide-react'; // deve essere installato npm install lucide-react


// Definiamo le proprietà che il componente deve avere per funzionare:
// Lista delle carte in mano (myHand) e quelle sul tavolo (tableCards) 
// Senza questi dati, il componente si rifiuta di funzionare 
interface NotebookProps {
  myHand: Card[];       // Carte del giocatore (da G.players)
  tableCards: Card[];   // Carte pubbliche (da G.tableCards)
  matchID: string;
  myPlayerID: string;
}

// Estrae i dati passati dal padre (myHand, tableCards) e attiva l'hook per avere accesso alla memoria (notebook) e alle funzioni di modifica (toggleNote)
export function Notebook({ myHand, tableCards, matchID, myPlayerID }: NotebookProps) {
  const { notebook, toggleNote, clearNotebook } = useNotebook(matchID, myPlayerID); // Passo entrambi gli ID all'hook

  // Helper: Verifica se deve esserci una X AUTOMATICA
  const isAutoMarked = (id: string) => {
    const isHand = myHand.some(c => c.id === id); // È un metodo degli array che controlla se almeno uno degli elementi soddisfa la condizione. Cerca se l'ID della carta corrente esiste nella mano o sul tavolo
    const isTable = tableCards.some(c => c.id === id);
    return isHand || isTable;  // Restituisce true se la carta va esclusa automaticamente, quindi se è nella mano o sul tavolo
  };

  // Renderizza una riga della lista
  // Per ogni singola riga calcola tre booleani:
  // autoX: Il gioco dice che è esclusa?
  // manualX: L'utente l'ha esclusa a mano?
  // showX: Se uno dei due è vero, dobbiamo mostrare l'icona.
  const renderRow = (item: Card) => {
    const autoX = isAutoMarked(item.id); // True se è automatica (Mano/Tavolo)
    const manualX = notebook[item.id];   // True se l'utente ha cliccato
    
    // Mostra la X se una delle due condizioni è vera
    const showX = autoX || manualX;

    return (
      <div 
        key={item.id} 
        className="grid grid-cols-[1fr_60px] border-b border-gray-200 last:border-0 transition-colors hover:bg-gray-50"
      >
        {/* Nome Carta */}
        <div className="px-4 py-2 text-sm font-medium text-gray-700 flex items-center">
          {item.name}
        </div>

        {/* Casella Cliccabile */}
        <button
          onClick={() => {
            // Permetti il click SOLO se non è già segnato automaticamente
            if (!autoX) toggleNote(item.id);
          }}
          disabled={!!autoX} // Disabilita interazione se automatico
          // Se è cliccabile (!autoX) cambia cursore in "manina" e sfondo rossiccio al passaggio del mouse, mentre se è bloccato (autoX), cursore normale e sfondo grigio fisso
          className={`
            flex items-center justify-center border-l border-gray-200 h-full transition-all
            ${!autoX ? 'cursor-pointer hover:bg-red-50' : 'cursor-default bg-gray-100'} 
          `}
          aria-label={`Segna ${item.name}`}
        >
          {showX && (  // Se showX è falso, React non disegna nulla (casella vuota). Se è vero, disegna l'icona X.
            <X 
              className={`w-5 h-5 stroke-[3] ${
                // Distinzione visiva opzionale:
                // Se è automatica, usiamo un'opacità leggera per indicare "Lock"
                // Se è manuale, rosso pieno.
                autoX ? 'text-red-500/50' : 'text-red-600'
              }`} 
            />
          )}
        </button>
      </div>
    );
  };

  // Helper per creare le sezioni (Personaggi, Armi, Stanze):
  // Una funzione che evita di copiare-incollare codice tre volte. 
  // Prende un titolo ("Armi"), una lista (WEAPONS) e un colore, e genera tutto il blocco usando .map(renderRow) per creare le righe una a una
  const renderSection = (title: string, items: Card[], headerColor: string) => (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <h3 className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white ${headerColor}`}>
        {title}
      </h3>
      <div>{items.map(renderRow)}</div>
    </div>
  );

  return ( // Render Finale che assembla tutto. Usa flex-1 overflow-y-auto per dire che la lista occupa tutto lo spazio verticale rimanente e, se non ci sta, mette la barra di scorrimento
    // Container responsive: si adatta all'altezza/larghezza del genitore
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden rounded-xl border border-gray-200 shadow-lg">
      
      {/* Header Taccuino */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-gray-800">Taccuino</h2>
        <button 
          onClick={clearNotebook}
          className="text-xs text-gray-400 hover:text-red-600 font-semibold uppercase tracking-wide transition-colors"
        >
          Pulisci
        </button>
      </div>

      {/* Lista Scorrevole */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {renderSection("Sospettati", SUSPECTS, "bg-blue-600")}
        {renderSection("Armi", WEAPONS, "bg-red-600")}
        {renderSection("Stanze", ROOMS, "bg-amber-600")}
      </div>
      
    </div>
  );
}