import React from 'react';
import { ICON_SIZE, ICON_STROKE } from './iconProps';
import styles from './IconHeading.module.css';

function IconHeading({ icon: Icon, children, as: Tag = 'h2', className = '' }) {
  return (
    <Tag className={`${styles.heading} ${className}`.trim()}>
      {Icon ? (
        <span className={styles.icon} aria-hidden="true">
          <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
    </Tag>
  );
}

export default IconHeading;
