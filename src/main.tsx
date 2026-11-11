import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './assets/fonts';
import './styles/global.css';
import { bindActiveTime } from './analytics/activeTime';
import { useGameStore } from './game/store';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root is missing');

void useGameStore.persist.rehydrate();
bindActiveTime((ms) => useGameStore.getState().addActiveTime(ms));

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
