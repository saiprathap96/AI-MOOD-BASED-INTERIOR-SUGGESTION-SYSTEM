import React, { useState, useEffect, createContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SuggestionTool from './pages/SuggestionTool';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Toast from './components/Toast';

// Create Global Toast Context
export const ToastContext = createContext(null);

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  
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

  // Render current page based on state router
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={setCurrentPage} />;
      case 'tool':
        return <SuggestionTool navigate={setCurrentPage} />;
      case 'history':
        return <History navigate={setCurrentPage} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home navigate={setCurrentPage} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="flex flex-col min-h-screen bg-brand-cream dark:bg-brand-bgDark text-brand-dark dark:text-brand-cream transition-colors duration-300">
        
        {/* Navigation Header */}
        <Header 
          currentPage={currentPage} 
          navigate={setCurrentPage} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />

        {/* Page Body with transition */}
        <main className="flex-grow pt-20 pb-12">
          <div className="animate-fade-in">
            {renderPage()}
          </div>
        </main>

        {/* Footer */}
        <Footer navigate={setCurrentPage} />

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
    </ToastContext.Provider>
  );
}
