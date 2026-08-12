import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './SupabaseClient'; 
import LoginPage from './LoginPage';
import CourseInfoPage from './CourseInfoPage';
import RegistrationPage from './RegistrationPage';
import CyclePage from './CyclePage';
import LevelsPage from './LevelsPage';
import FreeLesson from './FreeLesson';
import AdminHub from './AdminHub';
import StudentHub from './StudentHub'; // <-- 1. IMPORTED THE STUDENT HUB

// ==========================================
// RBAC & LOCALIZATION WRAPPER COMPONENT
// ==========================================
const ProtectedRoute = ({ children, allowedRoles, forcedLanguage, isStudentHub = false, onUnauthorized }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      // 1. Check if logged into Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        onUnauthorized();
        return;
      }

      // 2. Fetch from 'profiles'
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        onUnauthorized();
        return;
      }

      // 3. Verify Role RBAC
      if (allowedRoles.includes(userData.role) || userData.role === 'GENERAL_MANAGER' || userData.role === 'Admin') {
        setIsAuthorized(true);
        applyLocalization(forcedLanguage, isStudentHub);
      } else {
        onUnauthorized();
      }
      
      setLoading(false);
    };

    checkAuthAndRole();
  }, [allowedRoles, forcedLanguage, isStudentHub, onUnauthorized]);

  const applyLocalization = (lang, blockTranslation) => {
    document.documentElement.lang = lang;
    let metaGoogle = document.querySelector('meta[name="google"]');
    
    if (blockTranslation) {
      document.documentElement.classList.add("notranslate");
      document.documentElement.setAttribute("translate", "no");
      
      if (!metaGoogle) {
        metaGoogle = document.createElement('meta');
        metaGoogle.name = "google";
        document.head.appendChild(metaGoogle);
      }
      metaGoogle.content = "notranslate";
    } else {
      document.documentElement.classList.remove("notranslate");
      document.documentElement.removeAttribute("translate");
      if (metaGoogle) {
        metaGoogle.remove();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08203e]"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'login';
  });

  useEffect(() => {
    window.history.replaceState({ page: currentPage }, '', `#${currentPage}`);

    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', `#${page}`);
  }, []);

  // <-- 2. THE SMART ROUTER -->
  // This checks the database to see WHERE they should go after clicking Login
  const handleLoginSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('login');
      return;
    }

    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userData && (userData.role === 'Student' || userData.role === 'STUDENT')) {
      navigate('hub');
    } else {
      navigate('admin');
    }
  };

  const handleStartFreeLesson = async () => {
    navigate('free-lesson');
    const currentCount = parseInt(localStorage.getItem('olaFreeLessonClicks') || '0') + 1;
    localStorage.setItem('olaFreeLessonClicks', currentCount.toString());

    const pipelineUrl = "YOUR_DISCORD_WEBHOOK_OR_API_URL_HERE"; 

    const payload = {
      content: `📘 **Free Lesson Initiated!**`,
      embeds: [
        {
          title: "Outloud Language Academy",
          color: 23455, 
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
      {/* PUBLIC ROUTES */}
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess} // <-- 3. WIRED THE SMART ROUTER HERE
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
          onFreeTrialClick={handleStartFreeLesson} 
        />
      )}

      {currentPage === 'free-lesson' && (
        <FreeLesson 
          onReturnHome={() => navigate('login')} 
          onReturnToRegister={() => navigate('register')} 
        />
      )}

      {/* PROTECTED ROUTES */}
      {currentPage === 'admin' && (
        <ProtectedRoute 
          allowedRoles={['TEACHER', 'GENERAL_MANAGER', 'Admin']} 
          forcedLanguage="en" 
          onUnauthorized={() => navigate('login')}
        >
          <AdminHub 
            onReturnHome={() => navigate('login')} 
          />
        </ProtectedRoute>
      )}

      {currentPage === 'hub' && (
        <ProtectedRoute 
          allowedRoles={['Student', 'STUDENT']} // <-- MATCHES YOUR DATABASE
          forcedLanguage="en" 
          isStudentHub={true} 
          onUnauthorized={() => navigate('login')}
        >
          {/* 4. UN-COMMENTED THE STUDENT HUB */}
          <StudentHub onReturnHome={() => navigate('login')} /> 
        </ProtectedRoute>
      )}
    </>
  );
}