import React from 'react';

const App = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <iframe
        src="http://localhost:8501"
        title="Sports Integrity Dashboard"
        style={{ height: '100%', width: '100%', border: 'none' }}
      />
    </div>
  );
};

export default App;
