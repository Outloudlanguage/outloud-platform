import React from 'react';
import { OutLoudHorizontalLogo } from './components/OutLoudBrand';
import { OnboardingFormCard } from './components/LandingTrialAndEnroll';

const RegistrationPage = ({ onReturnHome, onFreeTrialClick }) => {
  return (
    <div className="min-h-screen w-full bg-[#f6f7fc] text-[#23274d] font-montserrat flex flex-col relative overflow-x-hidden">
      {/* Subtle Light-Mode Corner Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#fff3d1] rounded-full blur-3xl opacity-80" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e8eaf7] rounded-full blur-3xl opacity-90" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onReturnHome}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <OutLoudHorizontalLogo iconClass="w-10 h-10" wordmarkClass="h-8 w-auto" />
        </button>

        <button
          type="button"
          onClick={onReturnHome}
          className="ola-btn-outline px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer"
        >
          ← Volver al Inicio
        </button>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16 pt-2 flex items-center">
        <div className="w-full">
          <OnboardingFormCard onFreeTrialClick={onFreeTrialClick} />
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;