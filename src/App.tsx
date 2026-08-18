import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { ClipboardCheck, Globe, ChevronRight, QrCode, Key, ArrowLeft } from 'lucide-react';
import owlLogo from './assets/owl.png';

type ScreenType = 'home' | 'assessment';

export const App: React.FC = () => {
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Initialize Splash Screen and Android Back Button handling
  useEffect(() => {
    const initApp = async () => {
      try {
        await SplashScreen.hide();
      } catch {
        // Fallback for browser testing
      }
      
      const timer = setTimeout(() => {
        setShowAppSplash(false);
      }, 1500);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  // Handle hardware Android Back Button navigation
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', () => {
      if (currentScreen === 'assessment') {
        setCurrentScreen('home');
      } else {
        CapApp.minimizeApp();
      }
    });

    return () => {
      backListener.then(handler => handler.remove()).catch(() => {});
    };
  }, [currentScreen]);

  const showTemporaryNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  const handleGoToAssessment = () => {
    setCurrentScreen('assessment');
  };

  const handleGoToHome = () => {
    setCurrentScreen('home');
  };

  const handleScanQRPlaceholder = () => {
    showTemporaryNotice('Scan QR Code dipilih (QR Scanner akan aktif di Phase 4)');
  };

  const handleEnterCodePlaceholder = () => {
    showTemporaryNotice('Enter Unique Code dipilih (WebView akan aktif di Phase 5)');
  };

  const handleWebsitePlaceholder = () => {
    showTemporaryNotice('KP-OWL Website dipilih (WebView akan aktif di Phase 6)');
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
        position: 'relative',
      }}
      className="safe-area-container animate-fade-in"
    >
      {/* Toast Notice */}
      {actionNotice && (
        <div 
          style={{
            position: 'fixed',
            top: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2.5rem)',
            maxWidth: '420px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '0.85rem 1.25rem',
            borderRadius: '1rem',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            fontSize: '0.85rem',
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {actionNotice}
        </div>
      )}

      {/* Screen 1: Home Screen */}
      {currentScreen === 'home' && (
        <>
          <header style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
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

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
            <div 
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '2.25rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
                marginBottom: '1.75rem',
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

            <div style={{ width: '100%', marginTop: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                type="button"
                aria-label="Click Here To Assessment"
                className="btn-action btn-primary"
                onClick={handleGoToAssessment}
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

              <button 
                type="button"
                aria-label="KP-OWL Website"
                className="btn-action btn-secondary"
                onClick={handleWebsitePlaceholder}
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

          <footer style={{ padding: '1rem 0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              © {new Date().getFullYear()} PT Krakatau Posco • All Rights Reserved
            </p>
          </footer>
        </>
      )}

      {/* Screen 2: KP-OWL Assessment Screen */}
      {currentScreen === 'assessment' && (
        <>
          <header style={{ paddingTop: '0.5rem', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              aria-label="Back to Home"
              onClick={handleGoToHome}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '0.6rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>
              KP-OWL ASSESSMENT
            </span>
          </header>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
            <div 
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '2rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.1rem',
                marginBottom: '1.5rem',
                boxShadow: '0 20px 40px -15px rgba(11, 19, 43, 0.9), 0 0 30px rgba(56, 189, 248, 0.2)',
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

            <h1 
              style={{ 
                fontSize: '1.6rem', 
                fontWeight: 800, 
                color: '#ffffff', 
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              KP-OWL ASSESSMENT
            </h1>
            
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.4, textAlign: 'center', marginBottom: '2rem' }}>
              Pilih metode untuk mengakses assessment OWL
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Option 1: Scan QR Code */}
              <button 
                type="button"
                aria-label="Scan QR Code"
                className="btn-action btn-primary"
                onClick={handleScanQRPlaceholder}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '0.65rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode size={26} style={{ color: '#ffffff' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Scan QR Code</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                    Pindai kode QR assessment secara langsung
                  </div>
                </div>
                <ChevronRight size={22} style={{ opacity: 0.8 }} />
              </button>

              {/* Option 2: Enter Unique Code */}
              <button 
                type="button"
                aria-label="Enter Unique Code"
                className="btn-action btn-secondary"
                onClick={handleEnterCodePlaceholder}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div 
                  style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    padding: '0.65rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Key size={26} style={{ color: '#f97316' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Enter Unique Code</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>
                    Akses halaman assessment via URL / kode unik
                  </div>
                </div>
                <ChevronRight size={22} style={{ opacity: 0.6 }} />
              </button>
            </div>
          </main>

          <footer style={{ padding: '1rem 0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              KP-OWL Mobile Assessment Portal
            </p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
