import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { ClipboardCheck, Globe, ChevronRight } from 'lucide-react';
import owlLogo from './assets/owl.png';

export const App: React.FC = () => {
  const [showAppSplash, setShowAppSplash] = useState(true);

  useEffect(() => {
    // Hide native splash screen after Capacitor loads
    const initApp = async () => {
      try {
        await SplashScreen.hide();
      } catch {
        // Fallback if running directly in browser
      }
      
      // Keep splash visible briefly for smooth transition
      const timer = setTimeout(() => {
        setShowAppSplash(false);
      }, 1500);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  const handleAssessmentClick = () => {
    console.log('Assessment button pressed - Ready for Phase 3');
  };

  const handleWebsiteClick = () => {
    console.log('Website button pressed - Ready for Phase 5/6');
  };

  if (showAppSplash) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b132b',
          padding: '2rem',
          textAlign: 'center',
        }}
        className="safe-area-container"
      >
        <div 
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            padding: '1.25rem',
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.3)',
            animation: 'pulseGlow 2s infinite ease-in-out',
          }}
        >
          <img 
            src={owlLogo} 
            alt="OWL Logo" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain' 
            }} 
          />
        </div>

        <h2 style={{ fontSize: '0.9rem', color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
          KRAKATAU POSCO
        </h2>

        <h1 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 700, lineHeight: 1.3, maxWidth: '280px' }}>
          ONLINE KNOWLEDGE LEARNING
        </h1>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'fadeIn 0.6s infinite alternate' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', animation: 'fadeIn 0.6s 0.2s infinite alternate' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', animation: 'fadeIn 0.6s 0.4s infinite alternate' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
      className="safe-area-container animate-fade-in"
    >
      {/* Top Header Branding */}
      <header style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '2rem',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>
            KP-OWL LEARNING HUB
          </span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
        {/* Logo Container */}
        <div 
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '2.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px -15px rgba(11, 19, 43, 0.9), 0 0 30px rgba(37, 99, 235, 0.25)',
          }}
        >
          <img 
            src={owlLogo} 
            alt="OWL Logo" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain' 
            }} 
          />
        </div>

        {/* Title */}
        <p style={{ fontSize: '0.85rem', color: '#f97316', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          WELCOME TO
        </p>
        <h1 
          style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: '#ffffff', 
            lineHeight: 1.25, 
            marginBottom: '0.75rem',
            padding: '0 1rem',
          }}
        >
          ONLINE KNOWLEDGE<br />LEARNING
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '300px', lineHeight: 1.4 }}>
          Krakatau Posco Mobile Knowledge & Assessment Platform
        </p>

        {/* Action Buttons Section */}
        <div style={{ width: '100%', marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Button 1: Click Here To Assessment */}
          <button 
            type="button"
            className="btn-action btn-primary"
            onClick={handleAssessmentClick}
            style={{
              padding: '1.15rem 1.5rem',
              borderRadius: '1.15rem',
              fontSize: '1.05rem',
            }}
          >
            <ClipboardCheck size={22} style={{ color: '#ffffff' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Click Here To Assessment</span>
            <ChevronRight size={20} style={{ opacity: 0.8 }} />
          </button>

          {/* Button 2: KP-OWL Website */}
          <button 
            type="button"
            className="btn-action btn-secondary"
            onClick={handleWebsiteClick}
            style={{
              padding: '1.15rem 1.5rem',
              borderRadius: '1.15rem',
              fontSize: '1.05rem',
            }}
          >
            <Globe size={22} style={{ color: '#38bdf8' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>KP-OWL Website</span>
            <ChevronRight size={20} style={{ opacity: 0.6 }} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '1rem 0', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          © {new Date().getFullYear()} PT Krakatau Posco • All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default App;
