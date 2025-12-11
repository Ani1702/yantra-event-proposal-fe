'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  id: string;
  disabled?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder,
  error,
  id,
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(1); // February (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Event dates: 08-02-2026 to 14-02-2026
  const minDate = new Date(2026, 1, 7); // February 8, 2026
  const maxDate = new Date(2026, 1, 15); // February 14, 2026

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isDateInRange = (date: Date) => {
    return date >= minDate && date <= maxDate;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (isDateInRange(selectedDate)) {
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange(formattedDate);
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Week day headers
    const headers = weekDays.map((day) => (
      <div key={day} className="text-center font-bold text-xs p-2">
        {day}
      </div>
    ));

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isInRange = isDateInRange(date);
      const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      days.push(
        <div
          key={day}
          onClick={() => isInRange && handleDateSelect(day)}
          className={`text-center p-2 text-sm cursor-pointer border border-gray-200 ${
            isInRange
              ? isSelected
                ? 'bg-black text-white font-bold'
                : 'hover:bg-gray-100 text-black'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="px-2 py-1 border border-black hover:bg-gray-100 text-sm font-bold"
            disabled={currentMonth === 1 && currentYear === 2026}
          >
            ←
          </button>
          <div className="font-bold text-sm">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="px-2 py-1 border border-black hover:bg-gray-100 text-sm font-bold"
            disabled={currentMonth === 1 && currentYear === 2026}
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {headers}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 focus:outline-none transition-colors text-sm sm:text-base text-left flex justify-between items-center ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white cursor-pointer'
        } ${
          error
            ? 'border-red-600 focus:border-red-600'
            : 'border-black focus:border-gray-600'
        }`}
      >
        <span className={`${value ? 'text-black' : 'text-gray-500'} truncate pr-2`}>
          {formatDate(value)}
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
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 bg-white border-2 border-black shadow-lg">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}
