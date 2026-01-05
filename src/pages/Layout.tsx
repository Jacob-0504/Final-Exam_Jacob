import React, { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NavigationBar from '../../components/NavigationBar';     // 기존 헤더 컴포넌트 경로 맞춰주기
import Footer from '../../components/Footer';                   // 기존 푸터 컴포넌트 경로 맞춰주기
import Header from '../../components/Header';                   // 기존 헤더 컴포넌트 경로 맞춰주기
import { Website, WebsiteCategory } from '../types';

const Layout = () => {
    const [activeCategory, setActiveCategory] = useState<WebsiteCategory | 'All'>('All');
    const location = useLocation();
    const navigate = useNavigate();

    const isHomePage = location.pathname === '/';

    return (
        <div>
            <Header />
            <NavigationBar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

            {!isHomePage && (
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            )}

            <Outlet /> {/* 이 부분에 페이지별 콘텐츠가 렌더링됩니다. */}
            <Footer />
        </div>
    );
};

export default Layout;