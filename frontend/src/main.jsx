import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * World-Class Entry Point
 * Orchestrates the global providers including the Error Boundary, 
 * Router, and the core Application Logic.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The ErrorBoundary is the outermost shell. 
        It catches any logical failures in the Router or the App.
    */}
    <ErrorBoundary>
      <BrowserRouter>
        {/* Rendering <App /> inside BrowserRouter allows the 
            useLocation() hook within App.jsx to function correctly 
            for AnimatePresence transitions.
        */}
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);