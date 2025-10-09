import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}, ref) => {
  const inputRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    blur: () => inputRef.current.blur(),
    getValue: () => inputRef.current.value,
    setValue: (value) => {
      inputRef.current.value = value;
      setHasValue(!!value);
    },
  }));

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasValue(!!inputRef.current?.value);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className={`input-group ${className} ${error ? 'error' : ''} ${isFocused ? 'focused' : ''} ${hasValue ? 'has-value' : ''}`}>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type={type}
          className="input-field"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <div className="input-underline"></div>
      </div>
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;