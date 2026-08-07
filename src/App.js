import React, { useState } from 'react';
import LoginPage from './LoginPage';
import CourseInfoPage from './CourseInfoPage';
import RegistrationPage from './RegistrationPage';
import CyclePage from './CyclePage';
import LevelsPage from './LevelsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage
          onLogin={() => console.log('Login button clicked')}
          onInfoClick={() => setCurrentPage('info')}
        />
      )}

      {currentPage === 'info' && (
        <CourseInfoPage
          onReturnHome={() => setCurrentPage('login')}
          onRegister={() => setCurrentPage('register')}
          onCycleClick={() => setCurrentPage('cycle')}
          onLevelsClick={() => setCurrentPage('levels')}
        />
      )}

      {currentPage === 'cycle' && (
        <CyclePage
          onReturnHome={() => setCurrentPage('login')}
          onRegister={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'levels' && (
        <LevelsPage onReturnHome={() => setCurrentPage('login')} />
      )}

      {currentPage === 'register' && (
        <RegistrationPage onReturnHome={() => setCurrentPage('login')} />
      )}
    </>
  );
}
