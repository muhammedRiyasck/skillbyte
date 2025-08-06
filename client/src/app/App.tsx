// export default function App() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white">
//       <h1 className="text-3xl font-bold mb-4">Skillbyte</h1>
//       <button
//         onClick={() => {
//           console.log("Toggling theme");
//           document.documentElement.classList.toggle("dark");
//         }}
//         className="px-4 py-2 border rounded-md"
//       >
//         Toggle Dark Mode
//       </button>
//     </div>
//   );
// }

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
