import React, { useState } from 'react';
// Importa Costanti E Tipi dal tuo pacchetto shared
import { SUSPECTS, WEAPONS, ROOMS } from "@cluedo-digital/shared";
import type { SuspectID, WeaponID, RoomID } from "@cluedo-digital/shared";

// Qui definiamo il "pacchetto dati" (le properties) che questo componente accetta in ingresso
interface AccusationModalProps {
  // Usiamo i tipi esportati da models.ts
  onSubmit: (suspect: SuspectID, weapon: WeaponID, room: RoomID) => void; // Funzione chiamata quando l'utente invia l'accusa, che richiede i tre ID selezionati
}

// Qui creiamo una variabile (una funzione) e la esportiamo affinché possa essere usata. 
// Con React.FC<AccusationModalProps> diciamo a TypeScript che questa funzione è un componente React e deve obbedire alle "regole" scritte in AccusationModalProps
export const AccusationModal: React.FC<AccusationModalProps> = ({ onSubmit }) => { // Destrutturiamo le props, ovvero invece di scrivere (props) e poi props.onSubmit, scriviamo direttamente { onSubmit }, così da poter usare onSubmit (funzione passata dal padre) direttamente 
  // Inizializzazione Stato:
  // TypeScript ora sa esattamente che SuspectID viene da models.ts
  // Il "casting" (as SuspectID) serve per dire a TS che il valore iniziale è sicuro.
  const [selectedSuspect, setSelectedSuspect] = useState<SuspectID>(SUSPECTS[0].id); // Valori di partenza presi dal primo elemento delle liste
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponID>(WEAPONS[0].id); 
  const [selectedRoom, setSelectedRoom] = useState<RoomID>(ROOMS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Di default, quando si invia un form HTML, il browser ricarica la pagina (refresh). In React, ricaricare la pagina è disastroso (si può perdere lo stato, la connessione al gioco ecc.). Questa riga dice al Browser di non ricaricare la pagina, perchè la cosa è gestita via codice.
    onSubmit(selectedSuspect, selectedWeapon, selectedRoom); // Qui usiamo la funzione che il padre ci ha passato via props, consegnando i 3 valori che abbiamo memorizzato nello stato (selectedSuspect ecc.).

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-none p-4">
      
      <div className="bg-white rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden border-4 border-red-600 animate-bounce-in">
        
        <div className="bg-red-600 p-6 text-center shadow-md">
          <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
            Accusa Finale
          </h2>
          <p className="text-red-100 text-sm font-medium">
            Sei nella Busta Gialla. Devi formulare l'accusa.
            <br/>
            <span className="font-bold text-white">Non puoi tornare indietro.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50">
          
          <div className="space-y-4">
            
            {/* SELETTORE SOSPETTATO */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chi è stato?</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 font-medium text-gray-800 cursor-pointer"
                  value={selectedSuspect} // Impone di mostrare esattamente il valore memorizzato in selectedSuspect
                  onChange={(e) => setSelectedSuspect(e.target.value as SuspectID)} // L'utente clicca -> onChange aggiorna lo Stato chiamando la funzione che lo aggiorna setSelectedSuspect (prende la stringa che l'utente ha selezionato) -> Lo Stato aggiornato viene ripassato a value -> Il menu mostra la nuova scelta.
                > 
                  {SUSPECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} {/* Qui si prende l'array SUSPECTS (che contiene 6 oggetti) e per ogni elemento (chiamato s) si crea un pezzo di HTML <option>. 
                  key={s.id} è usato perchè React ha bisogno di un codice univoco per ogni elemento di una lista, per capire quale aggiornare se i dati cambiano. Usiamo l'ID univoco del personaggio.
                  value={s.id} è ciò che viene inviato al codice quando si seleziona. {s.name} è il testo visibile nel menu. */}
                </select> 
            </div>

            {/* SELETTORE ARMA */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Con quale arma?</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 font-medium text-gray-800 cursor-pointer"
                  value={selectedWeapon}
                  onChange={(e) => setSelectedWeapon(e.target.value as WeaponID)}
                >
                  {WEAPONS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            {/* SELETTORE STANZA */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">In quale stanza?</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 font-medium text-gray-800 cursor-pointer"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value as RoomID)}
                >
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg uppercase tracking-wider rounded-lg shadow-lg transform transition hover:scale-[1.02] active:scale-95"
            >
              APRI BUSTA
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};