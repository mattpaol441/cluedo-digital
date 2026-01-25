
// Error Mapper: Utility pura che prende un input (l'errore grezzo), lo elabora e restituisce un output (il messaggio in italiano), 
// senza mai toccare il database, lo stato di Redux o l'interfaccia grafica.
// Traduce i codici di errore Firebase in messaggi leggibili dall'utente.
 


// Mappa codici errore Firebase Auth (codici che iniziano con "auth/") a messaggi in italiano 
export const mapFirebaseAuthError = (code: string): string => {
  const errorMessages: Record<string, string> = { // Oggetto che funge da Dizionario (Lookup Table), con tipo di TypeScript che associa chiavi stringhe a valori che sono stringhe
    // Errori di registrazione
    'auth/email-already-in-use': 'Questa email è già registrata.',
    'auth/invalid-email': 'Indirizzo email non valido.',
    'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
    'auth/operation-not-allowed': 'Registrazione non abilitata.',
    
    // Errori di login
    'auth/user-not-found': 'Nessun account trovato con questa email.',
    'auth/wrong-password': 'Password errata.',
    'auth/invalid-credential': 'Credenziali non valide.',
    'auth/user-disabled': 'Questo account è stato disabilitato.',
    
    // Errori di rete/limite
    'auth/too-many-requests': 'Troppi tentativi falliti. Riprova più tardi.',
    'auth/network-request-failed': 'Errore di rete. Controlla la connessione.',
    
    // Errori di sessione
    'auth/requires-recent-login': 'Per sicurezza, effettua nuovamente il login.',
    'auth/session-expired': 'Sessione scaduta. Effettua nuovamente il login.',
  };

  return errorMessages[code] || 'Si è verificato un errore. Riprova.';
};

// Mappa codici errore Firestore a messaggi in italiano 
export const mapFirestoreError = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'permission-denied': 'Non hai i permessi per questa operazione.',
    'not-found': 'Documento non trovato.',
    'already-exists': 'Il documento esiste già.',
    'resource-exhausted': 'Quota superata. Riprova più tardi.',
    'unavailable': 'Servizio temporaneamente non disponibile.',
    'cancelled': 'Operazione annullata.',
    'unknown': 'Errore sconosciuto.',
  };

  return errorMessages[code] || 'Errore nel salvataggio dei dati.';
};

// Estrae il codice errore da un errore Firebase
export const getFirebaseErrorCode = (error: unknown): string => { // unknown (modo sicuro di dire "non lo so ancora") é il tipo più generico in TypeScript, che usa quando non sa nulla sull'input
  // Type Narrowing (restringimento del tipo): partiamo da un tipo generico (unknown) ed escludiamo via via le possibilità finché non siamo sicuri di cosa sia esattamente    
  if (error && typeof error === 'object' && 'code' in error) { // Verifica che error non sia null o undefined, che sia un oggetto (e non una stringa di testo semplice), e che abbia la proprietà "code"
    return (error as { code: string }).code; // Diciamo di trattarlo come un oggetto che ha una proprietà code di tipo stringa e restituisce il codice estratto 
  }
  return 'unknown';
};

// Helper combinato: estrae codice e traduce
export const translateFirebaseError = (error: unknown): string => { // Prende l'errore 
  const code = getFirebaseErrorCode(error); // Usa getFirebaseErrorCode per estrarre il codice pulito
  
  // Prova prima Auth, poi Firestore
  if (code.startsWith('auth/')) { // Se inizia con auth/
    return mapFirebaseAuthError(code); // Usa la mappa degli errori Auth
  }
  return mapFirestoreError(code); // Altrimenti usa la mappa degli errori Firestore
};
