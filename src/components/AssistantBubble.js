import React, { useEffect, useState } from 'react';
import styles from './AssistantBubble.module.css';

function AssistantBubble({ messages, interval = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [messages, interval]);

  return (
    <div className={styles.avatarContainer}>
      <img
        src="/ai-avatar.png"
        alt="Mairim – KI-assistent"
        className={styles.avatar}
      />
      <div className={styles.bubble}>
        {messages[index]}
      </div>
    </div>
  );
}

export default AssistantBubble;
