// Hero 3D 구름 시안 (사이트 코드와 분리된 독립 페이지)
// 확인: npm run dev → http://localhost:5173/prototypes/hero-clouds/
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import './style.css';
import HeroClouds from './HeroClouds';

createRoot(document.getElementById('root')).render(<HeroClouds />);
