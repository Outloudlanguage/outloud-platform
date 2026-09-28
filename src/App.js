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
import PlacementTest from './components/PlacementTest'; // <-- NEW: Placement Test

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

      // Read role directly from the secure, unforgeable JWT session token
      const userRole = (session.user.app_metadata?.role || '').toUpperCase();

      if (!userRole) {
        onUnauthorized();
        return;
      }

      // Normalize allowed roles to uppercase for safe comparison
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

      if (normalizedAllowed.includes(userRole) || userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN') {
        setIsAuthorized(true);
        applyLocalization(forcedLanguage);
      } else {
        onUnauthorized();
      }
      
      setLoading(false);
    };

    checkAuthAndRole();
  }, [allowedRoles, forcedLanguage, isStudentHub, onUnauthorized]);

  const applyLocalization = (lang) => {
    document.documentElement.lang = lang;
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

  // --- GLOBAL DOM PROTECTION & ANTI-TRANSLATION LOCK ---
  useEffect(() => {
    // 1. Anti-Translation (Always applies to everyone)
    document.documentElement.lang = "en";
    document.documentElement.classList.add("notranslate");
    document.documentElement.setAttribute("translate", "no");
    
    let metaGoogle = document.querySelector('meta[name="google"]');
    if (!metaGoogle) {
      metaGoogle = document.createElement('meta');
      metaGoogle.name = "google";
      document.head.appendChild(metaGoogle);
    }
    metaGoogle.content = "notranslate";

    // 2. Dynamic Anti-Theft Handlers
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleDragStart = (e) => {
      if (e.target.tagName.toLowerCase() === 'img') e.preventDefault();
    };

    const applyRestrictions = () => {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('dragstart', handleDragStart);
      
      if (!document.getElementById('anti-theft-style')) {
        const style = document.createElement('style');
        style.id = 'anti-theft-style';
        style.innerHTML = `
          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          /* Allow selection inside input fields so users can still type/edit */
          input, textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
        `;
        document.head.appendChild(style);
      }
    };

    const removeRestrictions = () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      const style = document.getElementById('anti-theft-style');
      if (style) style.remove();
    };

    // 3. Determine if user is Admin and dynamically toggle restrictions
    const enforceSecurityLevel = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.app_metadata?.role?.toUpperCase();
      
      if (role === 'ADMIN' || role === 'GENERAL_MANAGER') {
        removeRestrictions(); // Shields down for management
      } else {
        applyRestrictions();  // Shields up for public, students, and teachers
      }
    };

    // Run on initial load
    enforceSecurityLevel();

    // Listen for login/logout to instantly switch protection modes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const role = session?.user?.app_metadata?.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'GENERAL_MANAGER') {
        removeRestrictions();
      } else {
        applyRestrictions();
      }
    });

    return () => {
      removeRestrictions();
      authListener?.subscription.unsubscribe();
    };
  }, []);
  // ------------------------------------

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

    // Extract role securely from the cryptographically signed JWT
    const role = (session.user.app_metadata?.role || '').toLowerCase();

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
          onPlacementClick={() => navigate('placement-test')}
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

      {/* NEW: Placement Test Route (Public) */}
      {currentPage === 'placement-test' && (
        <PlacementTest />
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