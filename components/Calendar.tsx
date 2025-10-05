import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, disabled = false }) => {
  const [displayDate, setDisplayDate] = useState(selectedDate || new Date());

  const month = displayDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = displayDate.getFullYear();

  const handlePrevMonth = () => {
    if (disabled) return;
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (disabled) return;
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const firstDayOfMonth = new Date(year, displayDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, displayDate.getMonth() + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(<div key={`empty-${i}`}></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, displayDate.getMonth(), day);
      const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
      const isToday = currentDate.getTime() === today.getTime();
      const isSunday = currentDate.getDay() === 0;

      let cellClasses = "w-8 h-8 flex items-center justify-center rounded-full";
      
      if (!disabled) {
        cellClasses += " cursor-pointer hover:bg-green-100 transition-colors";
      }

      if (isSelected) {
        cellClasses += " bg-green-700 text-white font-bold";
      } else {
        if (isSunday) {
            cellClasses += " text-red-500";
        }
        if (isToday) {
            cellClasses += " ring-2 ring-green-500";
        }
      }

      grid.push(
        <div key={day} className={cellClasses} onClick={disabled ? undefined : () => onDateSelect(currentDate)}>
          {day}
        </div>
      );
    }
    return grid;
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className={`w-full max-w-sm mx-auto ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <h3 className="text-lg font-bold text-center mb-2">Check-in</h3>
        <div className="border rounded-lg p-3 bg-green-50">
        <div className="flex justify-between items-center mb-3">
          <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100" disabled={disabled}>&lt;</button>
          <div>
            <span className="font-bold text-green-700 text-sm">{month}</span>
            <span className="ml-2 font-semibold text-sm">{year}</span>
          </div>
          <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100" disabled={disabled}>&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
          {daysOfWeek.map((day, index) => (
            <div key={day} className={`font-semibold text-gray-500 ${index === 0 ? 'text-red-500' : ''}`}>
              {day}
            </div>
          ))}
          {renderCalendarGrid()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;