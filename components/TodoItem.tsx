import React, { useState, useCallback } from 'react';
import { Todo } from '../types';
import { Trash2, Check, X, Edit2, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { generateSubtasks } from '../services/geminiService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string, newDate: string) => void;
  onAddSubtasks: (id: string, subtasks: string[]) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate, onAddSubtasks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDate, setEditDate] = useState(todo.dueDate);
  const [isGenerating, setIsGenerating] = useState(false);

  // Logic to check if overdue
  const isOverdue = useCallback(() => {
    if (todo.isCompleted || !todo.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return todo.dueDate < today;
  }, [todo.isCompleted, todo.dueDate]);

  const handleSave = () => {
    if (editText.trim() === '') return;
    onUpdate(todo.id, editText, editDate);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditDate(todo.dueDate);
    setIsEditing(false);
  };

  const handleAiBreakdown = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const steps = await generateSubtasks(todo.text);
      if (steps.length > 0) {
        onAddSubtasks(todo.id, steps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const overdue = isOverdue();

  return (
    <div 
      className={`group flex flex-col gap-2 p-4 mb-3 rounded-xl shadow-sm border transition-all duration-200 
        ${todo.isCompleted ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-md'}
        ${overdue ? 'border-l-4 border-l-danger' : 'border-l-4 border-l-transparent'}
      `}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(todo.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${todo.isCompleted 
                ? 'bg-success border-success text-white' 
                : 'border-gray-300 text-transparent hover:border-primary'
              }`}
          >
            <Check size={14} strokeWidth={3} />
          </button>

          {isEditing ? (
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                autoFocus
              />
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden">
              <span 
                className={`text-base truncate transition-all duration-200 ${
                  todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
                }`}
              >
                {todo.text}
              </span>
              
              {todo.dueDate && (
                <div className={`flex items-center gap-1 text-xs mt-0.5 ${
                   overdue ? 'text-danger font-semibold' : 'text-gray-500'
                }`}>
                  {overdue && <AlertCircle size={12} />}
                  <Calendar size={12} />
                  <span>Due: {todo.dueDate}</span>
                  {overdue && <span>(Overdue)</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                title="Save"
              >
                <Check size={18} />
              </button>
              <button 
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              {!todo.isCompleted && !todo.subtasks && (
                <button
                  onClick={handleAiBreakdown}
                  disabled={isGenerating}
                  className={`p-2 rounded-lg transition-colors hidden sm:block ${
                    isGenerating ? 'text-primary animate-pulse' : 'text-purple-500 hover:bg-purple-50'
                  }`}
                  title="AI: Break down task"
                >
                  <Sparkles size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => onDelete(todo.id)}
                className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subtasks (AI Generated) */}
      {todo.subtasks && todo.subtasks.length > 0 && (
        <div className="ml-9 mt-1 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                <Sparkles size={12} /> AI Suggested Steps
            </p>
            <ul className="space-y-1">
                {todo.subtasks.map((sub, idx) => (
                    <li key={idx} className="text-sm text-purple-900 flex items-start gap-2">
                        <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                        {sub}
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};
