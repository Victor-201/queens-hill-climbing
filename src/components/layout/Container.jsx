import React from 'react';

/**
 * Outer .app wrapper — provides the dark background grid overlay context.
 */
export default function Container({ children }) {
  return (
    <div className="app">
      {children}
    </div>
  );
}
