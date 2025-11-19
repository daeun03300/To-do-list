import React, { useState, useMemo } from 'react';
import { Todo } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ todos, onToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    todos.forEach(todo => {
      if (todo.dueDate) {
        if (!map[todo.dueDate]) map[todo.dueDate] = [];
        map[todo.dueDate].push(todo);
      }
    });
    return map;
  }, [todos]);

  const renderDays = () => {
    const days = [];
    const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    // Empty slots for start
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50/30 min-h-[100px] border-b border-r border-gray-100"></div>
      );
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTodos = todosByDate[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={day} className={`min-h-[100px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 relative group flex flex-col gap-1 ${isToday ? 'bg-indigo-50/40' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700'}`}>
              {day}
            </span>
          </div>
          
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
            {dayTodos.map(todo => (
              <button 
                key={todo.id}
                onClick={() => onToggle(todo.id)}
                className={`text-left text-[10px] sm:text-xs px-1.5 py-1 rounded border transition-all w-full flex items-center gap-1.5
                  ${todo.isCompleted 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' 
                    : 'bg-white text-gray-700 border-indigo-100 hover:border-indigo-300 hover:shadow-sm'
                  }
                `}
                title={todo.text}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${todo.isCompleted ? 'bg-gray-400' : 'bg-indigo-500'}`} />
                <span className="truncate">{todo.text}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Fill remaining slots
    const remaining = totalSlots - (firstDay + daysInMonth);
    for (let i = 0; i < remaining; i++) {
        days.push(
            <div key={`end-${i}`} className="bg-gray-50/30 min-h-[100px] border-b border-r border-gray-100"></div>
        );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
         <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-500"/>
            {monthNames[month]} <span className="text-gray-400 font-normal">{year}</span>
         </h2>
         <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"><ChevronRight size={20} /></button>
         </div>
      </div>
      <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
           <div key={d} className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-gray-50 border-l border-gray-100">
        {renderDays()}
      </div>
    </div>
  );
}
