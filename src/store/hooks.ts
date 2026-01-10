// src/store/hooks.ts
import { type TypedUseSelectorHook, 
    useDispatch, 
    useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';


 // Versioni tipizzate di useDispatch e useSelector
 // Usiamo questi in tutta l'app invece di hook "nudi" di react-redux
 // Vantaggi:
 // - Autocomplete completo per le action
 // - Type safety senza scrivere (state: RootState) ogni volta
 // - Best practice di Redux + TypeScript
 

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;