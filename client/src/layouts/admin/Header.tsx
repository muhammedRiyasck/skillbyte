import ThemeToggle from "@shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { Menu, X, LayoutDashboard, Users, UserCheck, BookOpen, MessageSquare, FileText, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@core/store/Index";
import { logout } from "@features/auth/services/AuthService";
import { clearUser } from "@features/auth/AuthSlice";
import { toast } from "sonner";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((store: RootState) => store.auth.user);
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const handleLogout = async () => {
    const response = await logout();
    dispatch(clearUser());
    navigate(ROUTES.root, { replace: true })
    toast.success(response.message);
  };
  return (
    <header className="w-full sticky top-0 z-50">
      <div className=" bg-gray-50 border-b border-gray-200  px-4 md:px-8 dark:dark:bg-gray-800 shadow-md dark:border-b dark:border-gray-700 dark:text-white">
        <div className="container min-w-full flex justify-between items-center ">
          <div className="flex items-center ">
            <Link to={ROUTES.root} className="text-gray-600 dark:text-white text-lg font-bold">
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
        <>
          <div className="fixed top-0 right-0 min-h-screen w-80 bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-l border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-white cursor-pointer" />
                </button>
              </div>
              <nav className="space-y-2">
                <Link
                  to={ROUTES.root}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to={ROUTES.admin.instructorManagement}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <Users size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Instructor Management</span>
                </Link>
                <Link
                  to={ROUTES.admin.studentManagement}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCheck size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Student Management</span>
                </Link>
                <Link
                  to="#"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Courses Management</span>
                </Link>
                <Link
                  to="#"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare size={20} className="text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Mentor Feedback</span>
                </Link>
                <Link
                  to="#"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText size={20} className="text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Reports</span>
                </Link>
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-900/30 transition-all duration-200 group backdrop-blur-sm cursor-pointer"
                  >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
          <div
            className="fixed min-h-screen inset-0 bg-gray-900/50 dark:bg-gray-100/10 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </header>
  );
};

export default Header;
