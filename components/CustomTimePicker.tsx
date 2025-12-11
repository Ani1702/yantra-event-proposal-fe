'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  id: string;
}

export default function CustomTimePicker({
  value,
  onChange,
  placeholder,
  error,
  id,
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push({ value: timeString, label: timeString });
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel = value || placeholder;

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors cursor-pointer text-sm sm:text-base text-left flex justify-between items-center ${
          error
            ? 'border-red-600 focus:border-red-600'
            : 'border-black focus:border-gray-600'
        }`}
      >
        <span className={`${value ? 'text-black' : 'text-gray-500'} truncate pr-2`}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black max-h-60 overflow-y-auto shadow-lg">
          <ul>
            {timeOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-gray-100 text-black text-sm sm:text-base ${
                  option.value === value ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
