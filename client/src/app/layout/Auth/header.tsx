
import ThemeToggle from "../../../shared/ui/ThemeToggle";
const header = () => {
  return (
      <header>
            <nav className="bg-gray-50 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="/" className="text-gray-600 text-lg font-bold">Skillbyte</a>
                    <div>
                        <span className="text-gray-300 hover:text-white ml-8"><ThemeToggle /></span>
                    </div>
                </div>
            </nav>
        </header>
  )
}

export default header

