import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import './i18n';
import { App } from './App';
import { prefetchCommonPages } from './routes/pages';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Sahifa to'liq yuklangach — keyingi sahifalarni oldindan tayyorlab qo'yamiz (testlarda ishlamaydi)
if (import.meta.env.PROD) {
  window.addEventListener('load', () => prefetchCommonPages(), { once: true });
}
