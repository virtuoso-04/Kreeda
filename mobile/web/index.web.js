import React from 'react';
import { createRoot } from 'react-dom/client';

const TestComponent = () => {
  console.log('TestComponent is rendering');
  return <div style={{ textAlign: 'center', marginTop: '20px' }}>React App is Working!</div>;
};

const container = document.getElementById('root');
if (container) {
  console.log('Root container found');
  const root = createRoot(container);
  root.render(<TestComponent />);
} else {
  console.error('Root container not found');
}
