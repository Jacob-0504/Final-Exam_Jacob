import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './Homepage'; // 기존 대시보드 메인 컴포넌트
import NewPage from './pages/NewPage'; // 새로 만든 페이지 컴포넌트
import Tangtang from './pages/tangtang/tangtang';
import Asphalt from './pages/asphalt';
import GroovePlayer from './pages/GroovePlayer/GroovePlayer';
import Wlqwnd from './pages/Wlqwnd/Wlqwnd';
import GroovePlayer2 from './pages/GroovePlayer2/GroovePlayer2';


function App() {
  return (
    <BrowserRouter basename="Final-Exam_Jacob">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          {/* 여기에 새로운 페이지 라우트를 추가할 예정입니다. */}
          <Route path="/NewPage" element={<NewPage />} />
          <Route path="/tangtang" element={<Tangtang />} />
          <Route path="/asphalt" element={<Asphalt />} />
          <Route path="/groove-player" element={<GroovePlayer />} />
          <Route path="/wlqwnd" element={<Wlqwnd />} />
          <Route path="/groove-player2" element={<GroovePlayer2 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
