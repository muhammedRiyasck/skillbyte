import ThemeToggle from "../../shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png"
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNav, setIsNav] = useState(true);
  return (
    <header>
      <div className=" bg-gray-50 border-b border-gray-200 px-4 md:px-8 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700 dark:text-white">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center ">
          <Link to="/" className="text-gray-600 dark:text-white text-lg font-bold">
            <img className="w-30 h-20 " src={logo} alt="" />
          </Link>
           {isNav&&<nav className="hidden md:flex gap-6 text-sm font-medium px-8">
            <Link to="/" className="hover:text-indigo-500">
              Home
            </Link>
            <Link to="#" className="hover:text-indigo-500">Courses</Link>
            <Link to="#" className="hover:text-indigo-500">Support</Link>
          </nav>}
          </div>
          <div className="flex gap-4">
            
           <Link to='/auth/login'  className="border border-gray-400 dark:border-gray-500 text-sm px-5 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign In
            </Link>
              <ThemeToggle />
           <button className="md:hidden focus:outline-none dark:text-white " onClick={() => setIsOpen(!isOpen)}>
            {isOpen && isNav ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>
      {isOpen && isNav && (
        <div className="md:hidden bg-gray-50 text-center dark:bg-gray-800 dark:text-white px-4 pb-4 text-lg ">
          <Link to="/" className="block py-2 ">
              Home
            </Link>
            <Link to="#" className="block py-2">
              Courses
            </Link>
            <Link to="#" className="block py-2">
              About
            </Link>
        </div>
      )}
    </header>
  );
};

export default header;
