
import ThemeToggle from "../../../shared/ui/ThemeToggle";
import logo from "../../../assets/orginal_logo.png";
const header = () => {
  return (
      <header>
            <nav className="bg-gray-50 border-b border-gray-200 px-4 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="/" className="text-gray-600 dark:text-white text-lg font-bold"><img className="w-30 h-20" src={logo} alt="" /></a>
                    <div>
                        <span className="text-gray-300 hover:text-white ml-8"><ThemeToggle /></span>
                    </div>
                </div>
            </nav>
        </header>
  )
}

export default header

