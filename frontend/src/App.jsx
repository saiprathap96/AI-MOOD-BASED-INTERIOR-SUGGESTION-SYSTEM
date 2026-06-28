import React, { useState, useEffect, createContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SuggestionTool from './pages/SuggestionTool';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Toast from './components/Toast';
import AccessDenied from './components/AccessDenied';

// Create Global Toast Context
export const ToastContext = createContext(null);

// Auth Context — consumed by Header and other pages
export const AuthContext = createContext(null);

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');

  // Auth State (persisted across page reloads via sessionStorage)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('svs_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('svs_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Apply dark mode styling
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('svs_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist auth user to sessionStorage
  useEffect(() => {
    if (authUser) {
      sessionStorage.setItem('svs_auth_user', JSON.stringify(authUser));
    } else {
      sessionStorage.removeItem('svs_auth_user');
    }
  }, [authUser]);

  // Toast trigger function
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatically remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ── Auth handlers ─────────────────────────────────────────────────────
  const handleLogin = (user) => {
    setAuthUser(user);
    // Admins land on the dashboard; regular users go home
    setCurrentPage(user.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentPage('home');
    addToast('You have been logged out.', 'info');
  };

  // ── Role-gated navigation ─────────────────────────────────────────────
  const navigate = (pageId) => {
    // Admin-only pages: 'admin'
    if (pageId === 'admin' && authUser?.role !== 'admin') {
      addToast('Access denied. Admin privileges required.', 'error');
      return;
    }
    setCurrentPage(pageId);
  };

  // ── Page renderer ─────────────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'tool':
        return <SuggestionTool navigate={navigate} />;
      case 'history':
        return <History navigate={navigate} />;
      case 'admin':
        return authUser?.role === 'admin'
          ? <AdminDashboard navigate={navigate} />
          : <AccessDenied navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  // ── Show Login page when not authenticated ────────────────────────────
  if (!authUser) {
    return (
      <ToastContext.Provider value={{ addToast }}>
        <Login onLogin={handleLogin} darkMode={darkMode} />

        {/* Allow dark-mode toggle even on login page */}
        <button
          onClick={toggleDarkMode}
          className="fixed bottom-5 left-5 z-50 p-2.5 rounded-full bg-brand-cream dark:bg-brand-cardDark shadow-lg border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/10 transition-all duration-200"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode
            ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        {/* Toasts on login page */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full no-print">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </ToastContext.Provider>
    );
  }

  // ── Authenticated layout ──────────────────────────────────────────────
  return (
    <ToastContext.Provider value={{ addToast }}>
      <AuthContext.Provider value={{ authUser, handleLogout }}>
        <div className="flex flex-col min-h-screen bg-brand-cream dark:bg-brand-bgDark text-brand-dark dark:text-brand-cream transition-colors duration-300">

          {/* Navigation Header */}
          <Header
            currentPage={currentPage}
            navigate={navigate}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            authUser={authUser}
            onLogout={handleLogout}
          />

          {/* Page Body with transition */}
          <main className="flex-grow pt-20 pb-12">
            <div className="animate-fade-in">
              {renderPage()}
            </div>
          </main>

          {/* Footer */}
          <Footer navigate={navigate} />

          {/* Global Floating Toasts Container */}
          <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full no-print">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>

        </div>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}
