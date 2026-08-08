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

  // --- DISCORD PIPELINE LOGIC ---
  const handleStartFreeLesson = async () => {
    // 1. Immediately route the user to the lesson for a snappy experience
    navigate('free-lesson');

    // 2. Update the local counter 
    const currentCount = parseInt(localStorage.getItem('olaFreeLessonClicks') || '0') + 1;
    localStorage.setItem('olaFreeLessonClicks', currentCount.toString());

    // 3. Fire the payload to your Discord Pipeline
    // PASTE YOUR REGISTRATION PIPELINE OR WEBHOOK URL HERE
    const pipelineUrl = "YOUR_DISCORD_WEBHOOK_OR_API_URL_HERE"; 

    const payload = {
      content: `📘 **Free Lesson Initiated!**`,
      embeds: [
        {
          title: "Outloud Language Academy",
          color: 23455, // Outloud Signature Blue (#005b9f converted to decimal)
          description: "A prospective student has just entered the Free Lesson environment.",
          fields: [
            {
              name: "Local Device Clicks",
              value: `This device has started the lesson **${currentCount}** time(s).`,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
        }
      ]
    };

    try {
      await fetch(pipelineUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Discord pipeline delivery failed:", error);
    }
  };

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
          // Replaced the direct navigation with our new tracking function
          onFreeTrialClick={handleStartFreeLesson} 
        />
      )}

      {currentPage === 'free-lesson' && (
        <FreeLesson 
          onReturnHome={() => navigate('login')} 
          onReturnToRegister={() => navigate('register')} 
        />
      )}
    </>
  );
}