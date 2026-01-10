import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeNotification } from '../store/slices/uiSlice';


 // NotificationManager: Centro di comando che legge Redux e "spara" i toast
  
 // Flow:
 // 1. Componente fa: dispatch(addNotification({ message: "...", type: "info" }))
 // 2. Redux state.ui.notifications si aggiorna
 // 3. NotificationManager useSelector lo rileva
 // 4. useEffect crea il toast con react-hot-toast
 // 5. Dopo timeout, dispatch(removeNotification(id))
 // 6. Redux state si aggiorna, toast scompare
 // 
 // Vantaggi:
 // - Redux è source of truth per TUTTI i toast
 // - Se cambiamo libreria toast (da react-hot-toast a react-toastify), cambiamo solo questo file
 // - Scalabile e centralizzato
 

export function NotificationManager() {
  const notifications = useAppSelector(state => state.ui.notifications);
  const dispatch = useAppDispatch();

  // Ogni volta che una notifica viene aggiunta, mostra il toast
  useEffect(() => {
    notifications.forEach((notification) => {
      // Evita di mostrare lo stesso toast due volte
      const toastId = notification.id;

      // Scelta del tipo di toast in base al tipo di notifica
      const toastFunction = {
        info: toast,
        success: toast.success,
        warning: toast.error, // react-hot-toast non ha warning, usiamo error
        error: toast.error,
      }[notification.type] || toast;

      // Mostra il toast
      toastFunction(notification.message, {
        id: toastId, // ID unico per evitare duplicati
        duration: notification.duration || 3000, // Default 3 secondi
        position: 'top-center', // Posizione sullo schermo
      });

      // Se la notifica ha una durata definita, la rimuoviamo da Redux dopo
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        // Cleanup se il componente si smonta
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return (
    <>
      {/* Toaster: Componente che renderizza tutti i toast */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b', 
            color: '#f1f5f9', 
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#10b981', 
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444', 
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}