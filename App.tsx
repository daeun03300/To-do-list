import React, { useState, useEffect, useMemo } from 'react';
import { Todo, FilterType } from './types';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { Search, ListFilter, LayoutList } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart-todo-list-v1');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load todos", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('smart-todo-list-v1', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Handlers
  const handleAddTodo = (text: string, dueDate: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      isCompleted: false,
      dueDate,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTodo = (id: string, newText: string, newDate: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: newText, dueDate: newDate } : t));
  };

  const handleAddSubtasks = (id: string, subtasks: string[]) => {
     setTodos(prev => prev.map(t => t.id === id ? { ...t, subtasks } : t));
  }

  // Filtering & Search Logic
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Search Filter
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Status Filter
      if (filter === FilterType.ACTIVE) return !todo.isCompleted;
      if (filter === FilterType.COMPLETED) return todo.isCompleted;
      return true;
    });
  }, [todos, filter, searchQuery]);

  // Sort: Overdue & Uncompleted first, then by date
  const sortedTodos = useMemo(() => {
    return [...filteredTodos].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [filteredTodos]);

  if (!isLoaded) return null; // or a spinner

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <LayoutList size={24} />
              </div>
              To-do List
            </h1>
            <p className="text-gray-500 mt-2 ml-1">Manage your tasks efficiently</p>
          </div>
          
          <div className="mt-4 sm:mt-0 text-sm text-gray-400 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
             {todos.filter(t => !t.isCompleted).length} Tasks Pending
          </div>
        </header>

        {/* Controls: Filter & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto">
            {(Object.values(FilterType) as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  filter === f 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <TodoForm onAdd={handleAddTodo} />

        {/* Todo List */}
        <div className="space-y-1">
          {sortedTodos.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListFilter size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery 
                  ? `No tasks match "${searchQuery}"` 
                  : "Start by adding a new task above!"}
              </p>
            </div>
          ) : (
            sortedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onUpdate={handleUpdateTodo}
                onAddSubtasks={handleAddSubtasks}
              />
            ))
          )}
        </div>
        
        {/* Footer Info */}
        {todos.length > 0 && (
            <div className="mt-8 text-center text-xs text-gray-400">
                <p>Double-click or use the edit button to modify tasks.</p>
                <p className="mt-1">Tasks past their due date are highlighted in red.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default App;
