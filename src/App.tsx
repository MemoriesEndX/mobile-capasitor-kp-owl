import React from 'react';
import owlLogo from './assets/owl.png';

export const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <img src={owlLogo} alt="OWL Logo" style={{ width: '150px', height: 'auto', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>KP-OWL Mobile</h1>
      <p style={{ color: '#94a3b8', margin: '0' }}>Initialization Phase Complete</p>
    </div>
  );
};

export default App;
