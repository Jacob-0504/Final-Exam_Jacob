import React from 'react';
import { Website } from '../src/types';
import { Link } from 'react-router-dom';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const categoryBadgeColor = website.category === 'Game'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-sky-100 text-sky-800';

  return (
    <Link
      to={website.path} // website 데이터에 추가한 path 속성을 사용합니다.
      className="hover:scale-105"
    >
      <div className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <div className="relative overflow-hidden">
          <img
            src={website.thumbnailUrl}
            alt={website.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeColor}`}>
            {website.category}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold text-slate-800">{website.title}</h3>
          <p className="mt-2 flex-1 text-sm text-slate-600">{website.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Created: {formatDate(website.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WebsiteCard;
