import React from 'react';
import { WebsiteCategory } from '../src/types';

interface NavigationBarProps {
  activeCategory: WebsiteCategory | 'All';
  onSelectCategory: (category: WebsiteCategory | 'All') => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeCategory, onSelectCategory }) => {
  const categories: (WebsiteCategory | 'All')[] = ['All', 'Game', 'Music'];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center space-x-2 border-b border-slate-200">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
