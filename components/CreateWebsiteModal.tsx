import React, { useState, useEffect } from 'react';
import { Website, WebsiteCategory } from '../src/types';

interface CreateWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (websiteData: Omit<Website, 'id' | 'thumbnailUrl' | 'createdAt'>) => void;
}

const CreateWebsiteModal: React.FC<CreateWebsiteModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('Game');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTitle('');
      setDescription('');
      setCategory('Game');
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onCreate({ title, description, category });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-xl font-semibold leading-6 text-slate-900" id="modal-title">
            Create a New Website
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Website Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="e.g., My Awesome Project"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="A brief summary of what your website is about."
                required
              ></textarea>
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <fieldset className="mt-2">
              <legend className="sr-only">Website category</legend>
              <div className="flex items-center space-x-4">
                {(['Game', 'Music'] as WebsiteCategory[]).map((cat) => (
                  <div key={cat} className="flex items-center">
                    <input
                      id={cat}
                      name="category"
                      type="radio"
                      checked={category === cat}
                      onChange={() => setCategory(cat)}
                      className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor={cat} className="ml-2 block text-sm text-slate-900">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={!title.trim() || !description.trim()}
            >
              Create Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWebsiteModal;
