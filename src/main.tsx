import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './app/App';
import './assets/fonts';
import './styles/global.css';
import { bindActiveTime } from './analytics/activeTime';
import { routerBasename, rewardPath } from './config';
import { useGameStore } from './game/store';
import { RewardScreen } from './screens/RewardScreen';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root is missing');

void useGameStore.persist.rehydrate();
bindActiveTime((ms) => useGameStore.getState().addActiveTime(ms));

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path={rewardPath} element={<RewardScreen />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
