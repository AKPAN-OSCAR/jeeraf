import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './components/index.css';
import { initFavicon24HourCycle } from './services/faviconTheme';

// Start continuous 24-hour alternating SVG favicon cycle
initFavicon24HourCycle();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
