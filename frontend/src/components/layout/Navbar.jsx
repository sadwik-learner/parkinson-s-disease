import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'About', to: '/about' },
  { label: 'Assessment', to: '/assessment' },
  { label: 'Results', to: '/results' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const baseLinkClasses =
    'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200'

  const linkClassName = ({ isActive }) =>
    `${baseLinkClasses} ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
    }`

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className="text-lg font-semibold tracking-tight text-gray-900 transition-colors duration-200 hover:text-blue-700"
        >
          Parkinson&apos;s AI
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="text-2xl leading-none" aria-hidden="true">
            {isMenuOpen ? '×' : '☰'}
          </span>
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`${isMenuOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white md:hidden`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleLinkClick}
              className={linkClassName}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Navbar
