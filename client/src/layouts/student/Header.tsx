import ThemeToggle from "@shared/ui/ThemeToggle";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type{ RootState } from "@core/store/Index";
import { Menu, X, Home, BookOpen, Info, HelpCircle, Bell, User, LogOut } from "lucide-react";

import {logout} from '@features/auth/services/AuthService'

import AuthHeader from "../auth/Header";

import orginalLogo from "../../assets/OrginalLogo.png";
import { Link, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { clearUser } from "@features/auth/AuthSlice";
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
            <NavLink to="/" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold " : "text-[16px]"}>
              Home
            </NavLink>
            <NavLink to="/courses" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>Courses</NavLink>
            <NavLink to="/notYet" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>About</NavLink>
            <NavLink to="/notYet" className={({isActive}) => isActive ? "text-indigo-600 text-[16px] dark:text-indigo-400 font-semibold" : "text-[16px]"}>Support</NavLink>
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
            {/* <Link to="#">❤️</Link> */}
            <Link to="#">👤</Link>
          <p className="text-lg mr-2">{user&&user.name}</p>
          </div>
          <button onClick={handleLogout} className="border border-gray-400 dark:border-gray-500 text-sm lg:text-lg px-5 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer">
                Sign Out
            </button>
          <ThemeToggle />
          <button className="md:hidden focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <>
          <div className="fixed top-0 right-0 min-h-screen w-80 bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-l border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Student Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-white" />
                </button>
              </div>
              <nav className="space-y-2">
                <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
                  <Home size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Home</span>
                </NavLink>
                <NavLink to="/courses" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`} onClick={() => setIsOpen(false)}>
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
                <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <Bell size={20} className="text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Notifications</span>
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <User size={20} className="text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-900/30 transition-all duration-200 group backdrop-blur-sm"
                >
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
          <div
            className="fixed min-h-screen inset-0 bg-gray-900/50 dark:bg-gray-100/10 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </header>:<AuthHeader/>}
    </>
  );
};



export default Header;
