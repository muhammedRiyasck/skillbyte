import ThemeToggle from "../../../shared/ui/ThemeToggle";
import logo from "../../../assets/orginal_logo.png";
import { Link } from "react-router-dom";
const header = () => {
  return (
    <header>
      <nav className=" bg-gray-50 border-b border-gray-200 px-4 md:px-8 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700">
        <div className="container min-w-full flex justify-between items-center ">
          <Link to="/" className="text-gray-600 dark:text-white text-lg font-bold">
            <img className="w-30 h-20 " src={logo} alt="" />
          </Link>
          <div>
            <span className="text-gray-300 hover:text-white">
              <ThemeToggle />
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default header;
