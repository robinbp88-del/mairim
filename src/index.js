import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OnboardingFlow from './OnboardingFlow'; // 👈 bytt fra App til OnboardingFlow
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OnboardingFlow /> {/* 👈 vis onboarding først */}
  </React.StrictMode>
);

reportWebVitals();
