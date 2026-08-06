import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { formatDateTyping, isoToNo, isValidIsoDate, noToIso } from '../utils/dates';

const DateInput = forwardRef(function DateInput(
  { value = '', onChange, className, style, id, name, required },
  ref
) {
  const [text, setText] = useState(() => isoToNo(value));

  useEffect(() => {
    setText(isoToNo(value));
  }, [value]);

  const commit = (raw = text) => {
    const trimmed = String(raw).trim();
    if (!trimmed) {
      setText('');
      if (onChange) onChange('');
      return '';
    }

    const iso = noToIso(trimmed);
    if (iso && isValidIsoDate(iso)) {
      setText(isoToNo(iso));
      if (onChange) onChange(iso);
      return iso;
    }

    // Ugyldig dato — behold det brukeren skrev, men ikke lagre
    return '';
  };

  useImperativeHandle(ref, () => ({
    commit: () => commit(),
  }));

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      placeholder="ddmmåå eller 15.08.26"
      autoComplete="off"
      className={className}
      style={style}
      required={required}
      value={text}
      onChange={(e) => {
        const next = formatDateTyping(e.target.value);
        setText(next);
        const trimmed = next.trim();
        if (!trimmed) {
          if (onChange) onChange('');
          return;
        }
        const iso = noToIso(trimmed);
        if (iso && isValidIsoDate(iso)) {
          if (onChange) onChange(iso);
        }
      }}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
});

export default DateInput;
