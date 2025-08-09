import ThemeToggle from "../../shared/ui/ThemeToggle";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // For hamburger icons

import orginalLogo from "../../assets/orginal_logo.png";
import { Link } from "react-router-dom";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header>
      <div className="flex items-center justify-between  md:px-8  bg-gray-50 border-b border-gray-200 px-4 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700 dark:text-white">
        <div className="flex items-center text-2xl font-bold">
          <Link to="/">
            <img className="w-30 h-20" src={orginalLogo} alt="logo" />
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium px-8">
            <Link to="#" className="text-indigo-600 dark:text-indigo-400">
              Home
            </Link>
            <Link to="#">Courses</Link>
            <Link to="#">Support</Link>
          </nav>
        </div>
        
        <div className="flex gap-4">
          {/* search bar */}
          {/* <input
            type="text"
            placeholder="Search"
            className="hidden md:block px-2 py-1 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700"
          /> */}
          <div className="hidden md:flex items-center gap-4 text-xl">
            <Link to="#">🔔</Link>
            <Link to="#">❤️</Link>
            <Link to="#">👤</Link>
          </div>
          <ThemeToggle />
          <button className="md:hidden focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden flex justify-between bg-white dark:bg-gray-800 dark:text-white px-4 pb-4 text-lg">
          <div>
            <Link to="#" className="block py-2 ">
              Home
            </Link>
            <Link to="#" className="block py-2">
              Courses
            </Link>
            <Link to="#" className="block py-2">
              About
            </Link>
          </div>

          <div>
            <Link to="#" className="block py-2 ">
              👤
            </Link>
            <Link to="#" className="block py-2 ">
              ❤️
            </Link>
            <Link to="#" className="block py-2 ">
              🔔
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// export  function Header() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="w-full bg-white dark:bg-black shadow-md border">
//       <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <div className="text-xl font-bold">SkillByte</div>

//         {/* Desktop Nav Links */}
//         <div className="hidden md:flex space-x-6 ">
//           <a href="#" className="hover:text-primary dark:text-white">Home</a>
//           <a href="#" className="hover:text-primary">Courses</a>
//           <a href="#" className="hover:text-primary">About</a>
//         </div>
//         <ThemeToggle />
//         {/* Mobile Hamburger */}
//         <button
//           className="md:hidden focus:outline-none"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile Menu Dropdown */}
//       {isOpen && (
//         <div className="md:hidden bg-white dark:bg-black px-4 pb-4">
//           <a href="#" className="block py-2">Home</a>
//           <a href="#" className="block py-2">Courses</a>
//           <a href="#" className="block py-2">About</a>
//         </div>
//       )}
//     </nav>
//   );
// }

export default Header;
