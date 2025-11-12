import React from 'react';

const Spinner = () => (
  <div style={{
    display: 'inline-block',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '6px solid #00f0ff',
    borderTop: '6px solid #ff00c8',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px #00f0ff, 0 0 40px #ff00c8'
  }} />
);

export default Spinner;
