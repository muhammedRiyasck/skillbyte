import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {store} from '@core/store/Index.ts'
import { Provider } from 'react-redux'
import ThemeProvider from '@core/store/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>
)
