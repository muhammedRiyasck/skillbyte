

import { RouterProvider } from 'react-router-dom';
import router from '../core/router/Routes.tsx';
import { ThemeProvider } from '../core/store/Theme-Context.tsx';
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
