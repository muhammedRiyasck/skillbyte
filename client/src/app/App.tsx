

import { RouterProvider } from 'react-router-dom';
import router from '../core/router/routes.tsx';
import { ThemeProvider } from '../shared/lib/theme-context.tsx';
import { Toaster } from 'sonner';

function App() {
  return (
     <ThemeProvider>
      <Toaster position="top-center" richColors />
       <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
