import ThemeToggle from "@shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png"
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { Menu, X, Home, BookOpen, Info, HelpCircle, LogIn } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header >
      <div className=" bg-gray-50 border-b border-gray-200 px-4 md:px-8 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700 dark:text-white">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center ">
          <Link to={ROUTES.root} className="text-gray-600 dark:text-white text-lg font-bold">
            <img className="w-30 h-20 " src={logo} alt="logo" />
          </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium px-8">
            <NavLink to={ROUTES.root} className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold " : "text-[16px]"}>
              Home
            </NavLink>
            <NavLink to={ROUTES.student.courses} className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>Courses</NavLink>
            <NavLink to="/notYet" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>About</NavLink>
            <NavLink to="/notYet" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>Support</NavLink>
          </nav>
          </div>
          <div className="flex gap-4">
            
           <Link to={ROUTES.auth.signIn}  className=" hidden lg:block border border-gray-400 dark:border-gray-500 text-sm lg:text-lg px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign In
            </Link>
              <ThemeToggle />
           <button className="md:hidden focus:outline-none dark:text-white " onClick={() => setIsOpen(!isOpen)}>
            {isOpen  ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <>
          <div className="fixed top-0 right-0 min-h-screen w-80 bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-l border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-white" />
                </button>
              </div>
              <nav className="space-y-2">
                <NavLink to={ROUTES.root} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
                  <Home size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Home</span>
                </NavLink>
                <NavLink to={ROUTES.student.courses} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
                  <BookOpen size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Courses</span>
                </NavLink>
                <NavLink to="/notYet" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
                  <Info size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">About</span>
                </NavLink>
                <NavLink to="/notYet" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
                  <HelpCircle size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Support</span>
                </NavLink>
                <Link to={ROUTES.auth.signIn} className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Sign In</span>
                </Link>
              </nav>
            </div>
          </div>
          <div
            className="fixed inset-0 min-h-screen bg-gray-900/50 dark:bg-gray-100/10 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </header>
  );
};

export default Header;
