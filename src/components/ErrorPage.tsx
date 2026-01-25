/**
 * ErrorPage.tsx - Pagina di errore per React Router
 */

import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const ErrorPage: React.FC = () => {
  const error = useRouteError();

  let errorMessage = 'Si è verificato un errore imprevisto.';
  let errorCode = '500';

  if (isRouteErrorResponse(error)) {
    errorCode = String(error.status);
    if (error.status === 404) {
      errorMessage = 'Pagina non trovata.';
    } else if (error.status === 401) {
      errorMessage = 'Non sei autorizzato a visualizzare questa pagina.';
    } else if (error.status === 503) {
      errorMessage = 'Servizio temporaneamente non disponibile.';
    } else {
      errorMessage = error.statusText || error.data?.message || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        
        <h1 className="text-6xl font-bold text-white mb-2">{errorCode}</h1>
        
        <p className="text-xl text-slate-400 mb-8">{errorMessage}</p>
        
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          Torna alla Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
