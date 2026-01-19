// src/store/hooks.ts
import { type TypedUseSelectorHook, 
    useDispatch, 
    useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';


 // Versioni tipizzate (e intelligenti) di useDispatch e useSelector
 // Usiamo questi in tutta l'app invece di hook "nudi" di react-redux
 // Vantaggi:
 // - Autocomplete completo per le action
 // - Type safety senza scrivere (state: RootState) ogni volta (con state = dati vivi dello store definiti in src/store/index.ts e RootState = tipo di quello store che descrive la sua forma)
 // - Best practice di Redux + TypeScript
 

export const useAppDispatch = () => useDispatch<AppDispatch>(); // Così usa il tipo AppDispatch esportato da index.ts, e TypeScript sa che il dispatch è potenziato e accetta sia oggetti semplici che funzioni asincrone (e quindi che lo store può gestire thunk).
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // Così usa il tipo RootState esportato da index.ts, e TypeScript sa esattamente quali sono le sezioni (slices) dello store e i loro tipi, permettendo di accedere ai dati con sicurezza e senza errori.