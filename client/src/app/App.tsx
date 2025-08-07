

import { RouterProvider } from 'react-router-dom';
import router from './router/routes.tsx';
import { ThemeProvider } from '../shared/lib/theme-context.tsx';

function App() {
  return (
     <ThemeProvider>
       <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
