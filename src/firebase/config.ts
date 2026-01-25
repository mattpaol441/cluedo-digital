// File di configurazione Firebase
// Stiamo importando solo i pezzetti di Firebase che ci servono, così quando costruiremo l'app per la produzione, 
// Vite eliminerà tutto il codice di Firebase che non abbiammo importato (come Analytics, Functions ecc....), rendendo l'app leggerissima
import {
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions
} from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = { // FirebaseOptions interfaccia che controlla che le varie opzioni siano scritte correttamente  
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inizializza Firebase con Singleton Pattern: initializeApp crea l'istanza unica dell'applicazione Firebase in memoria (app sarà sempre lo stesso oggetto).
const app: FirebaseApp = initializeApp(firebaseConfig); //

// Inizializza servizi
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Quando l'utente si logga, Firebase salva il suo token in LocalStorage per ricordarsi di lui. Imposta persistenza (utente resta loggato dopo refresh).
// Firebase Web lo fa già in automatico, é una best practice difensiva
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Errore nell'impostazione della persistenza:", error);
  });

// Esporta app per eventuali altri servizi 
export default app;
