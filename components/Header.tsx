
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          My<span className="text-sky-600">Websites</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
