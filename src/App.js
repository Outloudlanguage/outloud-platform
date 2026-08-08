import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './LoginPage';
import CourseInfoPage from './CourseInfoPage';
import RegistrationPage from './RegistrationPage';
import CyclePage from './CyclePage';
import LevelsPage from './LevelsPage';
import FreeLesson from './FreeLesson';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    window.history.replaceState({ page: 'login' }, '', '#login');

    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        <RegistrationPage 
          onReturnHome={() => navigate('login')} 
          onFreeTrialClick={() => navigate('free-lesson')}
        />
      )}

      {currentPage === 'free-lesson' && (
        <FreeLesson 
          onReturnHome={() => navigate('login')} 
          onReturnToRegister={() => navigate('register')} // <-- ROUTED BACK TO REGISTRATION
        />
      )}
    </>
  );
}