import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './LoginPage';
import CourseInfoPage from './CourseInfoPage';
import RegistrationPage from './RegistrationPage';
import CyclePage from './CyclePage';
import LevelsPage from './LevelsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  // Set up the history listener when the app loads
  useEffect(() => {
    // 1. Initialize the very first history entry so the browser has a starting point
    window.history.replaceState({ page: 'login' }, '', '#login');

    // 2. Listen for the browser's physical back/forward buttons
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Clean up the listener if the component ever unmounts
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom navigation function to update React state AND browser history simultaneously
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', `#${page}`);
  }, []);

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage
          onLogin={() => console.log('Login button clicked')}
          onInfoClick={() => navigate('info')}
        />
      )}

      {currentPage === 'info' && (
        <CourseInfoPage
          onReturnHome={() => navigate('login')}
          onRegister={() => navigate('register')}
          onCycleClick={() => navigate('cycle')}
          onLevelsClick={() => navigate('levels')}
        />
      )}

      {currentPage === 'cycle' && (
        <CyclePage
          onReturnHome={() => navigate('login')}
          onRegister={() => navigate('register')}
        />
      )}

      {currentPage === 'levels' && (
        <LevelsPage onReturnHome={() => navigate('login')} />
      )}

      {currentPage === 'register' && (
        <RegistrationPage onReturnHome={() => navigate('login')} />
      )}
    </>
  );
}