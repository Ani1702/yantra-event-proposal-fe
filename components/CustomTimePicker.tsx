'use client';

import { useState } from 'react';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  id: string;
  disabled?: boolean;
}

export default function CustomTimePicker({
  value,
  onChange,
  placeholder,
  error,
  id,
  disabled = false,
}: CustomTimePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="time"
        id={id}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 focus:outline-none transition-colors text-sm sm:text-base ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white'
        } ${
          error
            ? 'border-red-600 focus:border-red-600'
            : 'border-black focus:border-gray-600'
        }`}
        style={{
          colorScheme: 'light',
        }}
      />
    </div>
  );
}
