import React, { useState } from 'react';
import { ArrowRight, Hash, Gamepad2 } from 'lucide-react';

interface JoinGameFormProps {
    onSubmit: (roomCode: string) => void;
    isLoading?: boolean; // Optional loading state
}

const JoinGameForm: React.FC<JoinGameFormProps> = ({ onSubmit, isLoading = false }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!code.trim()) {
            setError("Inserisci un codice valido.");
            return;
        }
        if (code.length < 6) {
            setError("Il codice deve essere di 6 caratteri.");
            return;
        }

        setError(null);
        onSubmit(code);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Converti in maiuscolo (i codici room sono uppercase)
        setCode(e.target.value.toUpperCase().trim());
        if (error) setError(null);
    };

    return (
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up relative overflow-hidden">
            
            {/* Background */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gamepad2 className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Unisciti alla partita</h2>
                <p className="text-slate-400 text-sm mb-6">
                    Inserisci il codice fornito dall'host della stanza.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="roomCode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Codice Stanza
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Hash className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                id="roomCode"
                                value={code}
                                onChange={handleChange}
                                placeholder="Es: ABC123"
                                maxLength={6}
                                disabled={isLoading}
                                className={`
                                    w-full pl-10 pr-4 py-4 bg-slate-950 text-white font-mono text-lg tracking-widest uppercase rounded-lg border 
                                    focus:outline-none focus:ring-2 transition-all duration-200
                                    ${error 
                                        ? 'border-red-500 focus:ring-red-500/50' 
                                        : 'border-slate-700 focus:border-yellow-500 focus:ring-yellow-500/50'
                                    }
                                `}
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-xs text-red-400 font-medium animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !code}
                        className={`
                            w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200
                            ${isLoading || !code
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-1'
                            }
                        `}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Connessione...</span>
                        ) : (
                            <>
                                Entra in Lobby <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinGameForm;