import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  helperText?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName = '',
  helperText,
  required = false,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-x2 ${containerClassName}`}>
      {label && (
        <label style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {label}
          {required && <span style={{ color: 'var(--brand-danger)' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        className={className}
        style={{
          borderColor: error ? 'var(--brand-danger)' : undefined,
        }}
        {...props}
      />
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--brand-danger)',
        }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a.75.75 0 00-1.025-1.088A3.81 3.81 0 0015 11h-3V9.75A2.75 2.75 0 009.25 7h-1.5A2.75 2.75 0 005 9.75v.5c0 .614.423 1.141 1 1.57V15a2 2 0 104 0v-1h2a2 2 0 100-4h-3V9.75c0-.69.56-1.25 1.25-1.25h1.5c.69 0 1.25.56 1.25 1.25V11h2.75a2.75 2.75 0 002.101.93z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {helperText && !error && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
