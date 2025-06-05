import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-3 text-lg border-2 rounded-2xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-base text-red-600">{error}</p>}
    </div>
  );
};

export default Input;