import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Work from './pages/Work';
import Contact from './pages/Contact';
import Booking30Min from './pages/Booking30Min';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'about', 'services', 'work', 'contact', '30min'].includes(hash)) {
      return hash;
    }
    return 'home';
  });

  // Simple hash router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'about', 'services', 'work', 'contact', '30min'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update hash when page changes state-wise
  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (currentPage !== currentHash) {
      window.location.hash = currentPage;
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'about':
        return <About setCurrentPage={setCurrentPage} />;
      case 'services':
        return <Services setCurrentPage={setCurrentPage} />;
      case 'work':
        return <Work setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <Contact />;
      case '30min':
        return <Booking30Min />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  const isBookingPage = currentPage === '30min';

  return (
    <div className="app-container">
      {!isBookingPage && <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      
      <main className="main-content" style={isBookingPage ? { marginTop: 0 } : undefined}>
        {renderPage()}
      </main>

      {!isBookingPage && <Footer setCurrentPage={setCurrentPage} />}

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-light-bg);
        }

        .main-content {
          flex: 1;
          margin-top: 80px; /* offset the fixed header */
        }
      `}</style>
    </div>
  );
}

export default App;
