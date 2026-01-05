import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-6 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} MyWebsites Creator. All Rights Reserved.</p>
        <p className="mt-2">주소: 강남역 1번 출구</p>
      </div>
    </footer>
  );
};

export default Footer;