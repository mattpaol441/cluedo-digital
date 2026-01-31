// useNotificationCount: hook per ottenere il conteggio delle notifiche non lette
// Usato da HamburgerWithNotifications.tsx
import { useAppSelector } from '../store/hooks';

export function useNotificationCount() {
    const { pendingRequests, lobbyInvites } = useAppSelector((state) => state.friends); // L'hook prende i dati dallo store Redux, specificamente dalla slice friends. Usa useAppSelector per accedere a state.friends.pendingRequests e state.friends.lobbyInvites. 
    // Questi dati sono stati precedentemente caricati da Firebase e salvati in Redux.

    // Conta richieste amicizia pendenti + inviti lobby pendenti
    const totalCount = pendingRequests.length + lobbyInvites.length;

    return {
        totalCount,
        friendRequestsCount: pendingRequests.length,
        lobbyInvitesCount: lobbyInvites.length,
    };
}

export default useNotificationCount;
