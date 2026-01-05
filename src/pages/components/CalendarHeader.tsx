
import React from 'react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrev, onNext, onToday }) => {
  const monthName = currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{monthName}</h2>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button 
            onClick={onPrev}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
            title="이전 달"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={onToday}
            className="px-3 py-1 text-sm font-medium hover:bg-slate-100 rounded-md transition-colors"
          >
            오늘
          </button>
          <button 
            onClick={onNext}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
            title="다음 달"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button className="px-4 py-1.5 text-sm font-medium bg-white text-indigo-600 rounded-md shadow-sm">월</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">주</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">일</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
