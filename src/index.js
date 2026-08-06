import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OnboardingFlow from './OnboardingFlow';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OnboardingFlow />
  </React.StrictMode>
);

serviceWorkerRegistration.register();

reportWebVitals();
