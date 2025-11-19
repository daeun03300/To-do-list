import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';

interface TodoFormProps {
  onAdd: (text: string, dueDate: string) => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    
    // Default to today if no date picked? No, user choice.
    // Requirement says "Input due date when adding".
    if (!dueDate) {
        // Optional: force a date? The prompt implies it should be input. 
        // Let's make it required for better UX based on the prompt.
        const today = new Date().toISOString().split('T')[0];
        onAdd(text, today);
    } else {
        onAdd(text, dueDate);
    }
    
    setText('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a new task..."
              className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
            />
        </div>
        
        <div className="relative sm:w-48">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
            </div>
            <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-gray-600 text-sm"
                required // Enforcing date selection as per interpretation of prompt "Input due date"
            />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || !dueDate}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </form>
  );
};
