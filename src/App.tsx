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
  ExternalLink,
  WifiOff,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import owlLogo from './assets/owl.png';

type ScreenType = 'home' | 'assessment' | 'qr-scanner' | 'assessment-webview' | 'owl-website-webview';
type ScannerStatus = 'idle' | 'scanning' | 'detected' | 'error' | 'permission_denied';

const ASSESSMENT_URL = 'http://owl.krakatauposco.co.id/assessment-access';
const WEBSITE_LOGIN_URL = 'http://owl.krakatauposco.co.id/login';

export const App: React.FC = () => {
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // QR Scanner States
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('idle');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // WebView States
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isIframeError, setIsIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  // Monitor Network Online/Offline Status
  useEffect(() => {
    const handleOffline = () => {
      if (currentScreen === 'assessment-webview' || currentScreen === 'owl-website-webview') {
        setIsIframeError(true);
      }
    };

    const handleOnline = () => {
      if ((currentScreen === 'assessment-webview' || currentScreen === 'owl-website-webview') && isIframeError) {
        reloadIframe();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [currentScreen, isIframeError]);

  // Hardware Android Back Button Handler
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', () => {
      if (currentScreen === 'owl-website-webview') {
        setCurrentScreen('home');
      } else if (currentScreen === 'assessment-webview') {
        setCurrentScreen('assessment');
      } else if (currentScreen === 'qr-scanner') {
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

  // App Lifecycle Listener
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(track => track.stop());

      setTimeout(async () => {
        const readerElement = document.getElementById('qr-reader');
        if (!readerElement) return;

        try {
          if (html5QrcodeRef.current) {
            try {
              await html5QrcodeRef.current.stop();
            } catch {
              // Ignore
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
              setScanResult(decodedText);
              setScannerStatus('detected');
              scanner.stop().catch(() => {});
            },
            () => {
              // Ignore frame error
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
        // Ignore
      }
      html5QrcodeRef.current = null;
    }
    setScannerStatus('idle');
  };

  const reloadIframe = () => {
    setIsIframeLoading(true);
    setIsIframeError(false);
    setIframeKey(prev => prev + 1);
  };

  const openAssessmentWebView = () => {
    if (!navigator.onLine) {
      setIsIframeError(true);
      setIsIframeLoading(false);
    } else {
      setIsIframeLoading(true);
      setIsIframeError(false);
    }
    setCurrentScreen('assessment-webview');
  };

  const openWebsiteLoginWebView = () => {
    if (!navigator.onLine) {
      setIsIframeError(true);
      setIsIframeLoading(false);
    } else {
      setIsIframeLoading(true);
      setIsIframeError(false);
    }
    setCurrentScreen('owl-website-webview');
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

  const isWebViewScreen = currentScreen === 'assessment-webview' || currentScreen === 'owl-website-webview';

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxWidth: isWebViewScreen ? '100vw' : '480px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
      className={isWebViewScreen ? '' : 'safe-area-container animate-fade-in'}
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
                onClick={openWebsiteLoginWebView}
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
                onClick={openAssessmentWebView}
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
                    onClick={() => showTemporaryNotice('Continue pressed')}
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

      {/* SCREEN 4: ASSESSMENT ACCESS WEBVIEW */}
      {currentScreen === 'assessment-webview' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#0f172a' }}>
          <header 
            style={{ 
              height: '56px',
              backgroundColor: '#0b132b', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0 1rem',
              zIndex: 20,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
              <button
                type="button"
                aria-label="Back to Assessment"
                onClick={() => setCurrentScreen('assessment')}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '0.45rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  KP-OWL ASSESSMENT
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={10} />
                  owl.krakatauposco.co.id/assessment-access
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Reload Page"
              onClick={reloadIframe}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCw size={18} className={isIframeLoading ? 'animate-spin' : ''} />
            </button>
          </header>

          <main style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#ffffff' }}>
            {isIframeLoading && !isIframeError && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  padding: '2rem',
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '3px solid rgba(56, 189, 248, 0.2)',
                    borderTopColor: '#38bdf8',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1.5rem',
                  }}
                />
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Loading Assessment Access...
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Connecting to http://owl.krakatauposco.co.id
                </p>
              </div>
            )}

            {isIframeError && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#0b132b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15,
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div 
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <WifiOff size={36} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Unable to Connect to Intranet
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.4, marginBottom: '1.75rem' }}>
                  Pastikan perangkat Anda terhubung ke jaringan / Wi-Fi internal POSCO untuk mengakses <br />
                  <code style={{ color: '#38bdf8' }}>owl.krakatauposco.co.id</code>
                </p>

                <button
                  type="button"
                  aria-label="Retry Connection"
                  className="btn-action btn-primary"
                  onClick={reloadIframe}
                  style={{ maxWidth: '200px', padding: '0.85rem 1.5rem', borderRadius: '1rem' }}
                >
                  <RotateCw size={18} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={ASSESSMENT_URL}
              title="KP-OWL Assessment Access"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff',
              }}
              onLoad={() => setIsIframeLoading(false)}
              onError={() => {
                setIsIframeLoading(false);
                setIsIframeError(true);
              }}
            />
          </main>
        </div>
      )}

      {/* SCREEN 5: KP-OWL WEBSITE LOGIN WEBVIEW */}
      {currentScreen === 'owl-website-webview' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#0f172a' }}>
          <header 
            style={{ 
              height: '56px',
              backgroundColor: '#0b132b', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0 1rem',
              zIndex: 20,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
              <button
                type="button"
                aria-label="Back to Home"
                onClick={() => setCurrentScreen('home')}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '0.45rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  KP-OWL WEBSITE
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={10} />
                  owl.krakatauposco.co.id/login
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Reload Page"
              onClick={reloadIframe}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCw size={18} className={isIframeLoading ? 'animate-spin' : ''} />
            </button>
          </header>

          <main style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#ffffff' }}>
            {isIframeLoading && !isIframeError && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  padding: '2rem',
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '3px solid rgba(56, 189, 248, 0.2)',
                    borderTopColor: '#38bdf8',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1.5rem',
                  }}
                />
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Loading KP-OWL Website...
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Connecting to http://owl.krakatauposco.co.id/login
                </p>
              </div>
            )}

            {isIframeError && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#0b132b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15,
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div 
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <WifiOff size={36} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Unable to Connect to Intranet
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.4, marginBottom: '1.75rem' }}>
                  Pastikan perangkat Anda terhubung ke jaringan / Wi-Fi internal POSCO untuk membuka <br />
                  <code style={{ color: '#38bdf8' }}>owl.krakatauposco.co.id/login</code>
                </p>

                <button
                  type="button"
                  aria-label="Retry Connection"
                  className="btn-action btn-primary"
                  onClick={reloadIframe}
                  style={{ maxWidth: '200px', padding: '0.85rem 1.5rem', borderRadius: '1rem' }}
                >
                  <RotateCw size={18} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={WEBSITE_LOGIN_URL}
              title="KP-OWL Website Login"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff',
              }}
              onLoad={() => setIsIframeLoading(false)}
              onError={() => {
                setIsIframeLoading(false);
                setIsIframeError(true);
              }}
            />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
