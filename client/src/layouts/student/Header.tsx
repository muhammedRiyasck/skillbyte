import ThemeToggle from "../../shared/ui/ThemeToggle";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type{ RootState } from "../../core/store";
import { Menu, X } from "lucide-react"; 

import {logout} from '../../features/auth/services/AuthService'

import AuthHeader from "../auth/Header";

import orginalLogo from "../../assets/OrginalLogo.png";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { clearUser } from "../../features/auth/AuthSlice";
const Header = () => {
  
  const user = useSelector((store:RootState)=>store.auth.user)
  const dispatch = useDispatch()
  const handleLogout = async ()=>{
    const response = await logout()
    dispatch(clearUser())
    toast.success(response.message)
  }

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
    {user?<header>
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
          <p>{user&&user.name}</p>
          <button onClick={handleLogout}  className="border border-gray-400 dark:border-gray-500 text-sm px-5 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer">
                Sign Out
            </button>
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
    </header>:<AuthHeader/>}
    </>
  );
};



export default Header;
