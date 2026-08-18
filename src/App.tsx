import React, { useState, useEffect, useRef } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ClipboardCheck, 
  Globe, 
  ChevronRight, 
  QrCode, 
  Key, 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import owlLogo from './assets/owl.png';

type ScreenType = 'home' | 'assessment' | 'qr-scanner';
type ScannerStatus = 'idle' | 'scanning' | 'detected' | 'error' | 'permission_denied';

export const App: React.FC = () => {
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // QR Scanner States
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('idle');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // Initialize Splash Screen
  useEffect(() => {
    const initApp = async () => {
      try {
        await SplashScreen.hide();
      } catch {
        // Fallback for browser
      }
      
      const timer = setTimeout(() => {
        setShowAppSplash(false);
      }, 1500);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  // Hardware Android Back Button Handler
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', () => {
      if (currentScreen === 'qr-scanner') {
        stopScanner();
        setCurrentScreen('assessment');
      } else if (currentScreen === 'assessment') {
        setCurrentScreen('home');
      } else {
        CapApp.minimizeApp();
      }
    });

    return () => {
      backListener.then(handler => handler.remove()).catch(() => {});
    };
  }, [currentScreen]);

  // App Lifecycle Listener (Stop camera when app is backgrounded)
  useEffect(() => {
    const stateListener = CapApp.addListener('appStateChange', (state) => {
      if (!state.isActive && currentScreen === 'qr-scanner') {
        stopScanner();
      }
    });

    return () => {
      stateListener.then(handler => handler.remove()).catch(() => {});
    };
  }, [currentScreen]);

  // Start Camera QR Scanner
  const startScanner = async () => {
    setScannerStatus('scanning');
    setErrorMessage(null);
    setScanResult(null);

    try {
      // Check camera permission & availability
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Stop temporary stream used for permission check
      stream.getTracks().forEach(track => track.stop());

      // Allow DOM element to mount
      setTimeout(async () => {
        const readerElement = document.getElementById('qr-reader');
        if (!readerElement) return;

        try {
          if (html5QrcodeRef.current) {
            try {
              await html5QrcodeRef.current.stop();
            } catch {
              // Ignore if already stopped
            }
          }

          const scanner = new Html5Qrcode('qr-reader');
          html5QrcodeRef.current = scanner;

          await scanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 240, height: 240 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // On QR Successfully Detected
              setScanResult(decodedText);
              setScannerStatus('detected');
              scanner.stop().catch(() => {});
            },
            () => {
              // Ignore frame scanning errors (keep scanning)
            }
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menginisialisasi kamera';
          setErrorMessage(msg);
          setScannerStatus('error');
        }
      }, 300);

    } catch (err: unknown) {
      console.error('Camera permission denied or unavailable:', err);
      setScannerStatus('permission_denied');
      setErrorMessage('Izin kamera diperlukan untuk memindai QR Code.');
    }
  };

  // Stop Camera Scanner
  const stopScanner = () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current.stop().catch(() => {});
        }
      } catch {
        // Ignore stop error
      }
      html5QrcodeRef.current = null;
    }
    setScannerStatus('idle');
  };

  const showTemporaryNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  const handleOpenQRScanner = () => {
    setCurrentScreen('qr-scanner');
    startScanner();
  };

  const handleBackFromScanner = () => {
    stopScanner();
    setCurrentScreen('assessment');
  };

  const handleEnterCodePlaceholder = () => {
    showTemporaryNotice('Enter Unique Code dipilih (WebView akan aktif di Phase 5)');
  };

  const handleWebsitePlaceholder = () => {
    showTemporaryNotice('KP-OWL Website dipilih (WebView akan aktif di Phase 6)');
  };

  const isOwlUrl = (text: string) => {
    try {
      const url = new URL(text);
      return url.hostname.includes('owl.krakatauposco.co.id');
    } catch {
      return false;
    }
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

      {/* SCREEN 1: HOME */}
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
                onClick={() => setCurrentScreen('assessment')}
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

      {/* SCREEN 2: ASSESSMENT */}
      {currentScreen === 'assessment' && (
        <>
          <header style={{ paddingTop: '0.5rem', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              aria-label="Back to Home"
              onClick={() => setCurrentScreen('home')}
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
              <button 
                type="button"
                aria-label="Scan QR Code"
                className="btn-action btn-primary"
                onClick={handleOpenQRScanner}
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

      {/* SCREEN 3: QR SCANNER */}
      {currentScreen === 'qr-scanner' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'space-between' }}>
          <header style={{ paddingTop: '0.5rem', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
            <button
              type="button"
              aria-label="Back to Assessment"
              onClick={handleBackFromScanner}
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
              Scan QR Code
            </span>
          </header>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Camera Permission Denied or Error UI */}
            {(scannerStatus === 'permission_denied' || scannerStatus === 'error') && (
              <div 
                style={{
                  width: '100%',
                  padding: '2rem 1.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  textAlign: 'center',
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={32} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Akses Kamera Dibutuhkan
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                  {errorMessage || 'Izin kamera diperlukan untuk memindai QR Code.'}
                </p>
                <button
                  type="button"
                  aria-label="Try Again"
                  className="btn-action btn-primary"
                  onClick={startScanner}
                  style={{ padding: '0.85rem 1.5rem', borderRadius: '1rem' }}
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Active Scanner View */}
            {(scannerStatus === 'scanning' || scannerStatus === 'idle') && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  style={{
                    position: 'relative',
                    width: '280px',
                    height: '280px',
                    borderRadius: '1.75rem',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), 0 0 0 4px rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <div id="qr-reader" style={{ width: '100%', height: '100%' }} />

                  {/* Corner Overlay Framing */}
                  <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderTopLeftRadius: 8 }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTopRightRadius: 8 }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderBottomLeftRadius: 8 }} />
                  <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderBottomRightRadius: 8 }} />
                </div>

                <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500, textAlign: 'center' }}>
                  Align QR code inside the frame
                </p>
              </div>
            )}

            {/* QR Result Detected State */}
            {scannerStatus === 'detected' && scanResult && (
              <div 
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                  animation: 'fadeIn 0.4s ease-out',
                }}
              >
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '2rem',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>QR Code Detected</span>
                </div>

                <div 
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    wordBreak: 'break-all',
                    fontSize: '0.9rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    marginBottom: '1rem',
                    maxHeight: '120px',
                    overflowY: 'auto',
                  }}
                >
                  {scanResult}
                </div>

                {isOwlUrl(scanResult) && (
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      marginBottom: '1.25rem',
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Official Krakatau Posco OWL URL Verified</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    aria-label="Scan Again"
                    className="btn-action btn-secondary"
                    onClick={startScanner}
                    style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', fontSize: '0.95rem' }}
                  >
                    <RefreshCw size={18} />
                    <span>Scan Again</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Continue"
                    className="btn-action btn-primary"
                    onClick={() => showTemporaryNotice('Continue pressed (WebView destination akan aktif di Phase 5)')}
                    style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', fontSize: '0.95rem' }}
                  >
                    <span>Continue</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </main>

          <footer style={{ padding: '1rem 0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              KP-OWL Mobile Native Camera Scanner
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
