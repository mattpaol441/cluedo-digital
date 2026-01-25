// é il punto di ingresso dell'applicazione React
// qui si genera la radice dell'applicazione stessa, dicendo a React di prendere il componente principale App e iniettarlo/montarlo dentro il div con id "root" in index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
) // Così rendiamo il Redux store accessibile a tutti i componenti tramite useSelector() e useDispatch()
// Senza Provider, i componenti non potevano accedere a Redux

