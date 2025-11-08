import React, { useState } from 'react';
import layout from '../Dashboard.module.css';

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={layout.collapsibleSection}>
      <div
        className={layout.sectionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div className={layout.sectionContent}>{children}</div>}
    </div>
  );
}

export default CollapsibleSection;
