import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, LayoutDashboard } from 'lucide-react';
import Logo from '../ui/Logo';
import SearchModal from '../search/SearchModal';
import { useAuthStore } from '../../store/authStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user, profile } = useAuthStore();

  // Determine dashboard path based on role
  const dashboardPath = profile?.role === 'admin' ? '/fa-admin' : '/dashboard';

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-sm py-2'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container-custom flex items-center justify-between gap-2">
        <Link 
          to="/" 
          className="flex items-center group flex-shrink-0"
        >
          <Logo className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-200" />
          <div className="ml-2 flex flex-col sm:flex-row sm:items-baseline leading-tight">
            <span className="text-sm sm:text-lg xl:text-lg 2xl:text-xl font-bold text-primary dark:text-white group-hover:text-secondary dark:group-hover:text-secondary transition-colors">
              Faith
            </span>
            <span className="text-xs sm:text-lg sm:ml-1 xl:text-lg 2xl:text-xl font-bold text-primary dark:text-white group-hover:text-secondary dark:group-hover:text-secondary transition-colors uppercase sm:normal-case tracking-wider sm:tracking-normal">
              Amplifiers
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/news">News</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/directory">Directory</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* Right side actions — Desktop */}
        <div className="hidden xl:flex items-center space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-primary dark:text-white" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-secondary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* Conditional: Return to Dashboard (logged in) OR Sign In (logged out) */}
          {user ? (
            <Link
              to={dashboardPath}
              className="btn btn-primary hover:scale-105 transform transition-all duration-200 whitespace-nowrap flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Return to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary hover:scale-105 transform transition-all duration-200 whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex xl:hidden items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-primary dark:text-white" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-secondary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="container-custom py-4">
            <div className="flex flex-col space-y-4">
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/news" onClick={() => setIsMenuOpen(false)}>
                News
              </MobileNavLink>
              <MobileNavLink to="/events" onClick={() => setIsMenuOpen(false)}>
                Events
              </MobileNavLink>
              <MobileNavLink to="/services" onClick={() => setIsMenuOpen(false)}>
                Services
              </MobileNavLink>
              <MobileNavLink to="/directory" onClick={() => setIsMenuOpen(false)}>
                Directory
              </MobileNavLink>
              <MobileNavLink to="/resources" onClick={() => setIsMenuOpen(false)}>
                Resources
              </MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </MobileNavLink>
              <div className="pt-2">
                {user ? (
                  <Link
                    to={dashboardPath}
                    className="btn btn-primary w-full text-center flex items-center justify-center gap-2 hover:scale-105 transform transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Return to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-primary w-full text-center hover:scale-105 transform transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

// Desktop navigation link
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`px-2 xl:px-3 py-2 rounded-md font-medium transition-all duration-200 xl:text-sm 2xl:text-base ${
        isActive
          ? 'bg-primary-light text-white dark:bg-primary-light dark:text-white'
          : 'text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary dark:hover:text-secondary'
      }`}
    >
      {children}
    </Link>
  );
};

// Mobile navigation link
const MobileNavLink: React.FC<{
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ to, onClick, children }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`block px-4 py-3 font-medium rounded-md transition-all duration-200 ${
        isActive
          ? 'bg-primary-light text-white dark:bg-primary-light dark:text-white'
          : 'text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary dark:hover:text-secondary'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Header;