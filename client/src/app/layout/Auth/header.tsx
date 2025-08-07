
import ThemeToggle from "../../../shared/ui/ThemeToggle";
const header = () => {
  return (
      <header>
            <nav className="bg-white-50 p-4 dark:bg-gray-900 shadow-2xl dark:border-b dark:border-gray-700">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="/" className="text-gray-600 dark:text-white text-lg font-bold">Skillbyte</a>
                    <div>
                        <span className="text-gray-300 hover:text-white ml-8"><ThemeToggle /></span>
                    </div>
                </div>
            </nav>
        </header>
  )
}

export default header

