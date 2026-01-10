import React from 'react';
import type { CluedoGameState } from '@cluedo-digital/shared';
// import { getSuspectName, getWeaponName, getRoomName, 
//   // getCardName 
// } from '@cluedo-digital/shared';
import GameCard from '../game/GameCard';
import { getCardImage } from '../utils/assets'; 
import { getCardById } from '@cluedo-digital/shared';

interface RefutationModalProps {
  G: CluedoGameState;
  playerID: string | null;
  moves: any;
  events: any;
  showResult: boolean;
  onCloseResult: () => void;
}

export const RefutationModal: React.FC<RefutationModalProps> = ({ G, playerID, moves, events, showResult, onCloseResult }) => {
  
  // 1. GESTIONE RISULTATO (Qualcuno ha mostrato una carta)
  if (G.lastRefutation && showResult) {
    const { suggesterId, refuterId, cardShown } = G.lastRefutation;
    const isSuggester = playerID === suggesterId;
    const suggesterName = G.players[suggesterId].name;
    const refuterName = refuterId ? G.players[refuterId].name : "Nessuno";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Esito Indagine</h2>
          
          {refuterId === null ? (
            <p className="text-lg text-gray-700 mb-6">
              Nessuno ha potuto smentire l'ipotesi di <span className="font-semibold">{suggesterName}</span>!
            </p>
          ) : (
            <div>
              <p className="text-lg text-gray-700 mb-4">
                <span className="font-bold text-red-600">{refuterName}</span> ha smentito l'ipotesi.
              </p>
              
              {isSuggester ? (
                <div className="flex flex-col items-center justify-center p-4 rounded-lg my-4 animate-pulse">
                  <h3 className="text-red-700 font-bold uppercase text-sm mb-4">Prova Trovata:</h3>
                  
                  {/* Mostriamo la carta vera invece del testo */}
                  {cardShown && (
                     <GameCard 
                        card={cardShown} // Qui cardShown è già un oggetto (arriva dal server)
                        image={getCardImage(cardShown)}
                        size="LARGE"
                     />
                  )}
                  
                  <p className="text-xs text-red-400 mt-4 italic">(Solo tu puoi vedere questa carta)</p>
                </div>
              ) : (
                <p className="italic text-gray-500 my-6 bg-gray-100 p-3 rounded">
                  (Il contenuto della prova è segreto)
                </p>
              )}
            </div>
          )}

              {isSuggester ? (
                <button 
                  onClick={() => {
                    onCloseResult();
                    if (events && events.endTurn) {
                      console.log("Fine turno chiamata dal modale risultato");
                      events.endTurn();
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition duration-200"
                >
                  Chiudi e Fine Turno
                </button>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  In attesa che {suggesterName} concluda il turno...
                </p>
              )}
        </div>
      </div>
    );
  }

  // 2. GESTIONE FASE ATTIVA (Qualcuno deve rispondere ORA)
  if (G.currentSuggestion) {
    const { suggesterId, currentResponder, matchingCards, suspect, weapon, room } = G.currentSuggestion;
    
    const isRefuter = playerID === currentResponder;
    const isSuggester = playerID === suggesterId;
    const suggesterName = G.players[suggesterId].name;
    
    // FIX: Controllo nullità
    const responderName = currentResponder ? G.players[currentResponder].name : "Sconosciuto";

    // A. TOCCA A TE SMENTIRE
    if (isRefuter) {
      return (
        <div className="fixed inset-0 bg-red-900/20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center border-4 border-red-600">
            <h2 className="text-3xl font-black text-red-600 mb-2 uppercase">Attenzione!</h2>
            <p className="text-gray-700 mb-2">
              <span className="font-bold">{suggesterName}</span> sospetta:
            </p>
            
            <div className="flex justify-center gap-2 mb-6 bg-gray-100 p-3 rounded-lg">
                {[suspect, weapon, room].map(id => {
                    const card = getCardById(id);
                    if (!card) return null;
                    return (
                        <GameCard 
                            key={id} 
                            card={card} 
                            image={getCardImage(card)} 
                            size="SMALL" // Usiamo SMALL per farle vedere bene tutte affiancate
                        />
                    );
                })}
            </div>
            
            <p className="mb-4 text-sm text-gray-600">Devi smentire mostrando una di queste carte:</p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              {matchingCards.map((cardId: string) => {
                const cardObj = getCardById(cardId);
                if (!cardObj) return null; // Per sicurezza

                return (
                  <GameCard 
                    key={cardId}
                    card={cardObj}
                    image={getCardImage(cardObj)}
                    size="SMALL" // O MEDIUM se preferisci
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => moves.refuteSuggestion(cardId)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // B. SEI TU CHE HAI CHIESTO (ATTESA)
    if (isSuggester) {
      return (
        <div className="fixed inset-0 bg-blue-900/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center border-4 border-indigo-600">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Indagine in corso...</h2>
            <p className="text-gray-700 mb-2">Hai ipotizzato:</p>
            
            <div className="flex justify-center gap-2 mb-6">
                {[suspect, weapon, room].map(id => {
                    const card = getCardById(id);
                    if (!card) return null;
                    return (
                        <GameCard 
                            key={id} 
                            card={card} 
                            image={getCardImage(card)} 
                            size="SMALL" 
                        />
                    );
                })}
            </div>
            
            
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">Interrogando <strong>{responderName}</strong>...</p>
            </div>
          </div>
        </div>
      );
    }

    // C. SEI UNO SPETTATORE
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-40 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center border-4 border-gray-400">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Indagine in corso...</h2>
          <p className="text-gray-700 mb-2">
            <span className="font-bold">{suggesterName}</span> sospetta:
          </p>
          <div className="flex justify-center gap-2 mb-6">
                {[suspect, weapon, room].map(id => {
                    const card = getCardById(id);
                    if (!card) return null;
                    return (
                        <GameCard 
                            key={id} 
                            card={card} 
                            image={getCardImage(card)} 
                            size="SMALL" 
                        />
                    );
                })}
            </div>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            <p className="text-gray-600"><strong>{responderName}</strong> sta controllando le carte...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};