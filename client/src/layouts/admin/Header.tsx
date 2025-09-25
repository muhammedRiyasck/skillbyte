import ThemeToggle from "../../shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../core/store/Index";
import { logout } from "../../features/auth/services/AuthService";
import { clearUser } from "../../features/auth/AuthSlice";
import { toast } from "sonner";

const header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((store: RootState) => store.auth.user);
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const handleLogout = async () => {
    const response = await logout();
    dispatch(clearUser());
     navigate("/",{replace:true})
    toast.success(response.message);
  };
  return (
    <header>
      <div className=" bg-gray-50 border-b border-gray-200  px-4 md:px-8 dark:dark:bg-gray-800 shadow-md dark:border-b dark:border-gray-700 dark:text-white">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center ">
            <Link to="/" className="text-gray-600 dark:text-white text-lg font-bold">
              <img className="w-30 h-20 " src={logo} alt="logo" />
            </Link>
          </div>
          <div className="flex gap-4">
            <ThemeToggle />
            {user && (
              <button className=" focus:outline-none dark:text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={32} /> : <Menu size={32} />}
              </button>
            )}
            {/* {user&&<p>{user.name}</p>} */}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="bg-gray-100 right-0 px-8 min-h-screen w-1/2 md:w-2/11 absolute float-end  dark:bg-gray-700 dark:text-white pb-4 text-lg ">
          <div className="mt-14">
            <Link to="/" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md">
              Dashboard
            </Link>
            <Link to="#" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md  ">
              Instructor Requests
            </Link>
            <Link to="#" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md  ">
              Users
            </Link>
            <Link to="#" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md ">
              Courses
            </Link>
            <Link to="#" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md ">
              Mentor Feedback
            </Link>
            <Link to="#" className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md ">
              Reports
            </Link>
            {user && (
              <span
                onClick={handleLogout}
                className="block py-2 my-3 px-4 rounded-md outline-1 outline-gray-200 hover:bg-gray-500 shadow-md cursor-pointer"
              >
                Sign Out
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default header;
