import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ICON_SIZE, ICON_STROKE } from './iconProps';
import styles from './DashboardChrome.module.css';

export function AccordionSection({
  id,
  icon: Icon,
  title,
  summary,
  open,
  onToggle,
  children,
}) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.header}
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        {Icon ? (
          <span className={styles.headerIcon} aria-hidden="true">
            <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          </span>
        ) : null}
        <span className={styles.headerText}>
          <span className={styles.headerTitle}>{title}</span>
          {summary ? <span className={styles.headerSummary}>{summary}</span> : null}
        </span>
        <ChevronDown
          className={`${styles.chevron}${open ? ` ${styles.chevronOpen}` : ''}`}
          size={18}
          strokeWidth={ICON_STROKE}
          aria-hidden="true"
        />
      </button>
      {open ? <div className={styles.body}>{children}</div> : null}
    </div>
  );
}

export function FormSheet({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <h3 className={styles.sheetTitle}>{title}</h3>
        {children}
        {footer ? <div className={styles.sheetActions}>{footer}</div> : null}
      </div>
    </div>
  );
}

export { styles as chromeStyles };
