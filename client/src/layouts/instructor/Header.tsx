import ThemeToggle from "@shared/ui/ThemeToggle";
import logo from "../../assets/OrginalLogo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { Menu, X, LayoutDashboard, User, BookOpen, Plus, Megaphone, Calendar, LogOut, DollarSign, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@core/store/Index";
import { logout } from "@features/auth/services/AuthService";
import { clearUser } from "@features/auth/AuthSlice";
import { toast } from "sonner";
import { useChat } from "@features/chat/hooks/useChat";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalUnreadCount } = useChat();
  const user = useSelector((store: RootState) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const handleLogout = async () => {
    const response = await logout();
    dispatch(clearUser());
    navigate(ROUTES.root, { replace: true })
    toast.success(response.message);
  };
  return (
    <header className="w-full sticky top-0 z-50">
      <div className=" bg-gray-50 px-4 md:px-8 dark:dark:bg-gray-800 drop-shadow-xl border-b border-b-gray-300 dark:border-b dark:border-gray-700 dark:text-white">
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
          </div>
        </div>
      </div>
      {isOpen && (
        <>
          <div className="fixed top-0 right-0 min-h-screen w-80 bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-l border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Instructor Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-white cursor-pointer" />
                </button>
              </div>
              <nav className="space-y-2">
                <Link to={ROUTES.root} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link to={ROUTES.chat} className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Messages</span>
                  </div>
                  {totalUnreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Link>
                <Link to={ROUTES.instructor.createCourseBase} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <Plus size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Create Course</span>
                </Link>
                <Link to={ROUTES.instructor.myCourses} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <BookOpen size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">My Courses</span>
                </Link>
                <Link to={ROUTES.instructor.dashboard} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <User size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Enrollments</span>
                </Link>
                <Link to={ROUTES.instructor.earnings} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <DollarSign size={20} className="text-yellow-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Earnings</span>
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <Megaphone size={20} className="text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Announcement</span>
                </Link>
                <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <Calendar size={20} className="text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Schedule Session</span>
                </Link>
                <Link to={ROUTES.instructor.profile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                  <User size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">My Profile</span>
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
