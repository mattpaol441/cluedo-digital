// é il punto di ingresso dell'applicazione React
// qui si genera la radice dell'applicazione stessa, dicendo a React di prendere il componente principale App e iniettarlo/montarlo dentro il div con id "root" in index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
) // Così rendiamo il Redux store accessibile a tutti i componenti tramite useSelector() e useDispatch()
// Senza Provider, i componenti non potevano accedere a Redux
