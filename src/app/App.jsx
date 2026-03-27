import React from 'react';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import Home from '../pages/Home.jsx';

export default function App() {
  return (
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  );
}
