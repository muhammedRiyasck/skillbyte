import ThemeToggle from "../../shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png"
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../core/store/Index";
import { logout } from "../../features/auth/services/AuthService";
import { clearUser } from "../../features/auth/AuthSlice";
import { toast } from "sonner";


const header = () => {
  const [isOpen, setIsOpen] = useState(false);
   const user = useSelector((store:RootState)=>store.auth.user)
  const dispatch = useDispatch()
  const handleLogout = async ()=>{
    const response = await logout()
    dispatch(clearUser())
    toast.success(response.message)
  }
  return (
    <header>
      <div className=" bg-gray-200 px-4 md:px-8 dark:dark:bg-gray-800 shadow-md dark:border-b dark:border-gray-700 dark:text-white">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center ">
          <Link to="/" className="text-gray-600 dark:text-white text-lg font-bold">
            <img className="w-30 h-20 " src={logo} alt="logo" />
          </Link>
           {/* {isNav&&<nav className="hidden md:flex gap-6 text-sm font-medium px-8">
            <Link to="/" className="hover:text-indigo-500">
              Home
            </Link>
            <Link to="#" className="hover:text-indigo-500">Courses</Link>
            <Link to="#" className="hover:text-indigo-500">Support</Link>
          </nav>} */}
          </div>
            {/* <ThemeToggle /> */}
          <div className="flex gap-4">
            
       
              <ThemeToggle />
           <button className=" focus:outline-none dark:text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {isOpen  ? <X size={32} /> : <Menu size={32} />}
          </button>
          </div>
        </div>
      </div>
      {isOpen  && (
        <div className="bg-gray-50 right-0 px-8 min-h-screen w-1/2 md:w-1/6 absolute float-end  dark:bg-gray-700 dark:text-white pb-4 text-lg ">
          <Link to="/" className="block py-2 ">
              Dashboard
            </Link>
            <Link to="#" className="block py-2">
              Instructor Requests
            </Link>
            <Link to="#" className="block py-2">
              User Managment
            </Link>
            <Link to="#" className="block py-2">
              Courses
            </Link>
            <button onClick={handleLogout} className="py-2 cursor-pointer">
              {user?'Sign Out':''}
            </button>
        </div>
      )}
    </header>
  );
};

export default header;
