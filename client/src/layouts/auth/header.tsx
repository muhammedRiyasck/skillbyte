import ThemeToggle from "../../shared/ui/ThemeToggle";
import logo from "../../assets/orginal_logo.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header>
      <nav className=" bg-gray-50 border-b border-gray-200 px-4 md:px-8 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center dark:text-white">
          <Link to="/" className="text-gray-600 dark:text-white text-lg font-bold">
            <img className="w-30 h-20 " src={logo} alt="" />
          </Link>
           <nav className="hidden md:flex gap-6 text-sm font-medium px-8">
            <Link to="/" className="hover:text-indigo-500">
              Home
            </Link>
            <Link to="#" className="hover:text-indigo-500">Courses</Link>
            <Link to="#" className="hover:text-indigo-500">Support</Link>
          </nav>
          </div>
          <div className="flex gap-4">
              <ThemeToggle />
           <button className="md:hidden focus:outline-none dark:text-white " onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </nav>
      {isOpen && (
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
