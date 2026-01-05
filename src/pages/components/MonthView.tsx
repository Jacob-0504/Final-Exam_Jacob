
import React from 'react';
import { CalendarEvent } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onEditEvent }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const days = [];
  // 이전 달의 빈 칸 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-slate-100 bg-slate-50/50" />);
  }

  // 이번 달 일수 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(ev => ev.date === dateStr);

    days.push(
      <div key={day} className="h-32 border-b border-r border-slate-100 p-2 relative group hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>
            {day}
          </span>
        </div>
        <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-hide">
          {dayEvents.map(event => (
            <button
              key={event.id}
              onClick={() => onEditEvent(event)}
              className={`w-full text-left px-2 py-0.5 rounded text-[11px] font-medium truncate border transition-all ${
                event.category === 'work' ? 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-200' :
                event.category === 'important' ? 'bg-rose-50 text-rose-700 border-rose-100 hover:border-rose-200' :
                event.category === 'personal' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-200' :
                'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {event.time && <span className="mr-1 opacity-70 font-normal">{event.time}</span>}
              {event.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 마지막 주의 빈 칸 채우기
  const totalCells = days.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    days.push(<div key={`empty-end-${i}`} className="h-32 border-b border-r border-slate-100 bg-slate-50/50" />);
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  );
};

export default MonthView;
