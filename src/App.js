import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './SupabaseClient'; 
import LoginPage from './LoginPage';
import CourseInfoPage from './CourseInfoPage';
import RegistrationPage from './RegistrationPage';
import CyclePage from './CyclePage';
import LevelsPage from './LevelsPage';
import FreeLesson from './FreeLesson';
import AdminHub from './AdminHub';
import StudentHub from './StudentHub';
import TeacherHub from './TeacherHub'; // <-- NEW: Imported the Teacher Hub

// ==========================================
// RBAC & LOCALIZATION WRAPPER COMPONENT
// ==========================================
const ProtectedRoute = ({ children, allowedRoles, forcedLanguage, isStudentHub = false, onUnauthorized }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        onUnauthorized();
        return;
      }

      const { data: userData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        onUnauthorized();
        return;
      }

      // Normalize database role and allowed roles to uppercase for safe comparison
      const userRole = (userData.role || '').toUpperCase();
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

      if (normalizedAllowed.includes(userRole) || userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN') {
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

    const role = (userData?.role || '').toLowerCase();

    // <-- FIX: Specific routing for all 3 roles -->
    if (role === 'student') {
      navigate('hub');
    } else if (role === 'teacher') {
      navigate('teacher');
    } else {
      navigate('admin'); // General Managers and Admins go here
    }
  };

  const handleStartFreeLesson = async () => {
    navigate('free-lesson');
    const currentCount = parseInt(localStorage.getItem('olaFreeLessonClicks') || '0') + 1;
    localStorage.setItem('olaFreeLessonClicks', currentCount.toString());
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess}
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
          allowedRoles={['GENERAL_MANAGER', 'Admin', 'ADMIN']} // Removed Teachers from here
          forcedLanguage="en" 
          onUnauthorized={() => navigate('login')}
        >
          <AdminHub 
            onReturnHome={() => navigate('login')} 
          />
        </ProtectedRoute>
      )}

      {/* NEW: Dedicated Teacher Route */}
      {currentPage === 'teacher' && (
        <ProtectedRoute 
          allowedRoles={['Teacher', 'TEACHER']} 
          forcedLanguage="en" 
          onUnauthorized={() => navigate('login')}
        >
          <TeacherHub 
            onReturnHome={() => navigate('login')} 
          />
        </ProtectedRoute>
      )}

      {currentPage === 'hub' && (
        <ProtectedRoute 
          allowedRoles={['Student', 'STUDENT']} 
          forcedLanguage="en" 
          isStudentHub={true} 
          onUnauthorized={() => navigate('login')}
        >
          <StudentHub onReturnHome={() => navigate('login')} /> 
        </ProtectedRoute>
      )}
    </>
  );
}