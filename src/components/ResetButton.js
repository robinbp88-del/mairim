import React from 'react';

const ResetButton = ({ onReset }) => {
  const handleClick = () => {
    const confirmed = window.confirm('Er du sikker på at du vil slette alt?');
    if (confirmed) {
      onReset();
    }
  };

  return (
    <div style={{ marginTop: '40px', textAlign: 'center' }}>
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Slett alt
      </button>
    </div>
  );
};

export default ResetButton;
